Super simple twitter proxy.

You'll need your twitter key, secret, token, and token secret.

Really only good for one search term to `/search?term=foo`

Caches tweets for 5 seconds (twitter limits searches to 180 every 15 minutes,
or one per 5 seconds). If you need to support more terms, you'll want to
increase the `VALID_FOR`. The limit might actually be 450 / 15 minutes for
this, since it uses app auth.

