import { NextFunction, Request, Response } from 'express';
import { Platform } from '@prisma/client';
import { z } from 'zod';
import { prisma } from '../utils/prisma';
import * as allegroApiService from '../services/allegro-api.service';
import { encrypt } from '../utils/crypto';
import * as allegroOAuthService from '../services/allegro-oauth.service';
import * as otomotoOAuthService from '../services/otomoto-oauth.service';
import * as olxOAuthService from '../services/olx-oauth.service';
import * as ebayApiService from '../services/ebay-api.service';
import { env } from '../utils/env';
import { oauthHtml } from '../utils/oauth-html';
import { getUserId } from '../utils/request-helpers';

const saveMappingsSchema = z.object({
  items: z.array(
    z.object({
      internalCategoryId: z.string().min(1),
      externalCategoryId: z.string().min(1),
      externalCategoryName: z.string().optional(),
      attributeSchema: z.record(z.unknown()).optional(),
    }),
  ),
});

export async function getPlatforms(req: Request, res: Response, next: NextFunction) {
  try {
    const platforms = await prisma.userPlatform.findMany({
      where: { userId: getUserId(req) },
      orderBy: { platform: 'asc' },
    });
    res.json(platforms);
  } catch (error) {
    next(error);
  }
}

export async function connectPlatform(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = req.params.platform as Platform;
    if (platform === Platform.ALLEGRO && !env.ALLEGRO_MOCK) {
      res.status(400).json({
        error: 'Use Allegro OAuth flow. Call /api/platforms/allegro/oauth/start and open authorizationUrl.',
      });
      return;
    }
    if (platform === Platform.OLX && !env.OLX_MOCK) {
      res.status(400).json({
        error: 'Use OLX OAuth flow. Call /api/platforms/olx/oauth/start and open authorizationUrl.',
      });
      return;
    }
    if (platform === Platform.EBAY && !env.EBAY_MOCK) {
      res.status(400).json({
        error: 'Use eBay OAuth flow. Call /api/platforms/ebay/oauth/start and open authorizationUrl.',
      });
      return;
    }
    if (platform === Platform.OTOMOTO && !env.OTOMOTO_MOCK) {
      res.status(400).json({
        error: 'Use Otomoto connect flow. Call /api/platforms/otomoto/connect with username/password.',
      });
      return;
    }

    const accessToken =
      typeof req.body?.accessToken === 'string' && req.body.accessToken.trim()
        ? encrypt(req.body.accessToken.trim())
        : undefined;
    const connected = await prisma.userPlatform.upsert({
      where: { userId_platform: { userId: getUserId(req), platform } },
      create: { userId: getUserId(req), platform, isActive: true, connectedAt: new Date(), accessToken },
      update: { isActive: true, connectedAt: new Date(), ...(accessToken && { accessToken }) },
    });
    res.status(201).json(connected);
  } catch (error) {
    next(error);
  }
}

export async function disconnectPlatform(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = req.params.platform as Platform;
    await prisma.userPlatform.update({
      where: { userId_platform: { userId: getUserId(req), platform } },
      data: { isActive: false },
    });
    res.status(204).send();
  } catch (error) {
    next(error);
  }
}

export async function getAllegroCategories(req: Request, res: Response, next: NextFunction) {
  try {
    const parentId = typeof req.query.parentId === 'string' ? req.query.parentId : undefined;
    const result = await allegroApiService.getAllegroCategories(getUserId(req), parentId);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function saveAllegroMappings(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = saveMappingsSchema.parse(req.body);
    const result = await allegroApiService.saveAllegroMappings(getUserId(req), payload.items);
    res.json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllegroOAuthStart(req: Request, res: Response, next: NextFunction) {
  try {
    const authorizationUrl = allegroOAuthService.buildAuthorizationUrl(getUserId(req));
    res.json({ authorizationUrl });
  } catch (error) {
    next(error);
  }
}

// ─── Otomoto ─────────────────────────────────────────────────────────────────

const otomotoConnectSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export async function connectOtomoto(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.OTOMOTO_MOCK) {
      // MOCK MODE — od razu aktywuje bez prawdziwego API
      const connected = await prisma.userPlatform.upsert({
        where: { userId_platform: { userId: getUserId(req), platform: 'OTOMOTO' } },
        create: { userId: getUserId(req), platform: 'OTOMOTO', isActive: true, connectedAt: new Date() },
        update: { isActive: true, connectedAt: new Date() },
      });
      res.status(201).json(connected);
      return;
    }
    const { username, password } = otomotoConnectSchema.parse(req.body);
    await otomotoOAuthService.connectWithCredentials(getUserId(req), username, password);
    const record = await prisma.userPlatform.findUnique({
      where: { userId_platform: { userId: getUserId(req), platform: 'OTOMOTO' } },
    });
    res.status(201).json(record);
  } catch (error) {
    next(error);
  }
}

// ─── OLX ─────────────────────────────────────────────────────────────────────

export async function getOlxOAuthStart(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.OLX_MOCK) {
      // MOCK MODE — od razu aktywuje
      const connected = await prisma.userPlatform.upsert({
        where: { userId_platform: { userId: getUserId(req), platform: 'OLX' } },
        create: { userId: getUserId(req), platform: 'OLX', isActive: true, connectedAt: new Date() },
        update: { isActive: true, connectedAt: new Date() },
      });
      res.status(201).json(connected);
      return;
    }
    const authorizationUrl = olxOAuthService.buildAuthorizationUrl(getUserId(req));
    res.json({ authorizationUrl });
  } catch (error) {
    next(error);
  }
}

export async function getOlxOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) {
      res.status(400).json({ error: 'Missing code or state' });
      return;
    }
    await olxOAuthService.exchangeCodeAndStoreConnection(code, state);
    res.send(oauthHtml('success', 'OLX'));
  } catch (error) {
    res.send(oauthHtml('error', 'OLX', 'Blad wymiany tokenu'));
  }
}

// ─── Allegro callbacks ───────────────────────────────────────────────────────

export async function getAllegroOAuthCallback(req: Request, res: Response, next: NextFunction) {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) {
      res.send(oauthHtml('error', 'ALLEGRO', 'Brak parametrow autoryzacji'));
      return;
    }
    await allegroOAuthService.exchangeCodeAndStoreConnection(code, state);
    res.send(oauthHtml('success', 'ALLEGRO'));
  } catch (error) {
    res.send(oauthHtml('error', 'ALLEGRO', 'Blad wymiany tokenu'));
  }
}

export async function testPlatformConnection(req: Request, res: Response, next: NextFunction) {
  try {
    const platform = req.params.platform.toUpperCase() as Platform;
    const record = await prisma.userPlatform.findUnique({
      where: { userId_platform: { userId: getUserId(req), platform } },
    });
    if (!record?.isActive) {
      res.status(400).json({ error: 'Platforma niepodlaczona' });
      return;
    }
    if (platform === Platform.ALLEGRO && !env.ALLEGRO_MOCK) {
      const me = await allegroApiService.getAllegroMe(getUserId(req));
      res.json({ ok: true, message: `Allegro: zalogowany jako ${me.login}` });
      return;
    }
    if (platform === Platform.EBAY && !env.EBAY_MOCK) {
      const offers = await ebayApiService.getOffers(getUserId(req), 1);
      const count = Array.isArray((offers as { offers?: unknown[] }).offers)
        ? (offers as { offers?: unknown[] }).offers!.length
        : 0;
      res.json({ ok: true, message: `eBay: polaczenie aktywne (offers: ${count})` });
      return;
    }
    res.json({ ok: true, message: `${platform}: polaczenie aktywne (MOCK)` });
  } catch (error) {
    next(error);
  }
}

