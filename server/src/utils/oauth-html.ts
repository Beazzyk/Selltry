import { env } from './env';

export function oauthHtml(status: 'success' | 'error', platform: string, message?: string): string {
  const msg =
    status === 'success'
      ? 'Połączono! Zamykanie...'
      : `Błąd: ${message ?? 'Spróbuj ponownie.'}`;
  return `<!DOCTYPE html><html><head><meta charset="utf-8"><title>OAuth</title></head><body>
<p style="font-family:sans-serif;padding:40px;text-align:center">${msg}</p>
<script>
if(window.opener){
  window.opener.postMessage({type:'OAUTH_CONNECTED',platform:'${platform}',status:'${status}'},'${env.CLIENT_URL}');
  window.close();
}else{
  setTimeout(function(){window.location.href='${env.CLIENT_URL}/platforms';},1500);
}
</script>
</body></html>`;
}
