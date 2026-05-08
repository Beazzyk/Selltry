import { NextFunction, Request, Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../middleware/auth.middleware';
import * as ebayOAuthService from '../services/ebay-oauth.service';
import * as ebayApiService from '../services/ebay-api.service';
import { env } from '../utils/env';

function userId(req: Request): string {
  return (req as AuthRequest).userId;
}

const marketplaceSchema = z.object({
  marketplaceId: z.string().min(1).default('EBAY_US'),
});

export async function getEbayOAuthStart(req: Request, res: Response, next: NextFunction) {
  try {
    if (env.EBAY_MOCK) {
      res.status(400).json({ error: 'eBay is in MOCK mode. Set EBAY_MOCK=false to start OAuth.' });
      return;
    }
    const authorizationUrl = ebayOAuthService.buildAuthorizationUrl(userId(req));
    res.json({ authorizationUrl });
  } catch (error) {
    next(error);
  }
}

export async function getEbayOAuthCallback(req: Request, res: Response) {
  try {
    const code = typeof req.query.code === 'string' ? req.query.code : '';
    const state = typeof req.query.state === 'string' ? req.query.state : '';
    if (!code || !state) {
      res.send(oauthHtml('error', 'EBAY', 'Brak parametrow autoryzacji'));
      return;
    }
    await ebayOAuthService.exchangeCodeAndStoreConnection(code, state);
    res.send(oauthHtml('success', 'EBAY'));
  } catch {
    res.send(oauthHtml('error', 'EBAY', 'Blad wymiany tokenu'));
  }
}

export async function getEbayFulfillmentPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getFulfillmentPolicies(userId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayPaymentPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getPaymentPolicies(userId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayReturnPolicies(req: Request, res: Response, next: NextFunction) {
  try {
    const { marketplaceId } = marketplaceSchema.parse(req.query);
    const data = await ebayApiService.getReturnPolicies(userId(req), marketplaceId);
    res.json(data);
  } catch (error) {
    next(error);
  }
}

export async function getEbayOffers(req: Request, res: Response, next: NextFunction) {
  try {
    const data = await ebayApiService.getOffers(userId(req));
    res.json(data);
  } catch (error) {
    next(error);
  }
}

function oauthHtml(status: 'success' | 'error', platform: string, message?: string): string {
  const msg = status === 'success' ? 'Polaczono! Zamykanie...' : `Blad: ${message ?? 'Sprobuj ponownie.'}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OAuth</title></head><body>
<p style="font-family:sans-serif;padding:40px;text-align:center">${msg}</p>
<script>
if(window.opener){
  window.opener.postMessage({type:'OAUTH_CONNECTED',platform:'${platform}',status:'${status}'},'*');
  window.close();
}else{
  setTimeout(function(){window.location.href='${env.CLIENT_URL}/platforms';},1500);
}
</script>
</body></html>`;
}
