import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import * as ebayOAuthService from '../services/ebay-oauth.service';
import * as ebayApiService from '../services/ebay-api.service';
import { env } from '../utils/env';
import { oauthHtml } from '../utils/oauth-html';
import { getUserId } from '../utils/request-helpers';

const marketplaceSchema = z.object({
  marketplaceId: z.string().min(1).default('EBAY_US'),
});

const callbackQuerySchema = z.object({
  code: z.string().min(1),
  state: z.string().min(1),
});

export async function getEbayOAuthStart(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.EBAY_MOCK) {
      res.status(400).json({ error: 'eBay is in MOCK mode. Set EBAY_MOCK=false to start OAuth.' });
      return;
    }
    const authorizationUrl = ebayOAuthService.buildAuthorizationUrl(getUserId(req));
    res.json({ authorizationUrl });
  } catch (error) {
    next(error);
  }
}

export async function getEbayOAuthCallback(req: Request, res: Response) {
  try {
    const result = callbackQuerySchema.safeParse(req.query);
    if (!result.success) {
      res.send(oauthHtml('error', 'EBAY', 'Brak parametrów autoryzacji'));
      return;
    }
    await ebayOAuthService.exchangeCodeAndStoreConnection(result.data.code, result.data.state);
    res.send(oauthHtml('success', 'EBAY'));
  } catch {
    res.send(oauthHtml('error', 'EBAY', 'Błąd wymiany tokenu'));
  }
}

export async function getEbayFulfillmentPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getFulfillmentPolicies(getUserId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayPaymentPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getPaymentPolicies(getUserId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayReturnPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getReturnPolicies(getUserId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayOffers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ebayApiService.getOffers(getUserId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
}
