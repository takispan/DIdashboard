require('dotenv').config('./.env');

const clientSecret = process.env.clientSecret
const clientID = process.env.clientID
const clientRedirect = process.env.clientRedirect
const dmgincID = process.env.dmgincID
const PORT = process.env.PORT
const fetch = require('node-fetch')
const {
  catchAsync
} = require('./utils')

const express = require('express');

const app = express();

//Lead to index.html if nothing given
app.get('/', (request, response) => {
  return response.sendFile('index.html', {
    root: '.'
  });
});

//After coming back from login do this
app.get('/auth/redirect', catchAsync(async (req, res) => {

  const data = {
    client_id: clientID,
    client_secret: clientSecret,
    grant_type: 'authorization_code',
    redirect_uri: clientRedirect,
    code: req.query.code,
    scope: ['identify', 'guilds']
  };

  //Perform a request to Discord’s token exchange URL
  const response = await fetch('https://discord.com/api/oauth2/token', {
    method: 'POST',
    body: new URLSearchParams(data),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    }
  })

  //Convert raw response to JSON
  const json = await response.json();

  const fetchDiscordUserInfo = await fetch('http://discordapp.com/api/users/@me', {
    headers: {
      Authorization: `Bearer ${json.access_token}`,
    }
  });
  const userInfo = await fetchDiscordUserInfo.json();

  const fetchDiscordUserGildInfo = await fetch('http://discordapp.com/api/users/@me/guilds', {
    headers: {
      Authorization: `Bearer ${json.access_token}`,
    }
  });
  const usergildInfo = await fetchDiscordUserGildInfo.json();

  //Checkup is in DI Server (id = 402229461682094080)
  //
  //
  //
  //
	const searchDI = usergildInfo.filter((x) => {return x.id==dmgincID})

	if (searchDI !== null && searchDI !== '') {
		res.redirect(`/?name=${userInfo.username}&id=${userInfo.id}&token=${json.access_token}&inserver=true`)
	} else {
		res.redirect(`/?name=${userInfo.username}&id=${userInfo.id}&token=${json.access_token}&inserver=false`)
	}

  //console.log(userInfo);
  //console.log(gildInfo);
  //console.log(gildInfo.id);
}));

//Using basic switch syntax to check which error we got and send a message to our client based on that
app.use((err, req, res, next) => {
  switch (err.message) {
    case 'NoCodeProvided':
      return res.status(400).send({
        status: 'ERROR',
        error: err.message,
      });
    default:
      return res.status(500).send({
        status: 'ERROR',
        error: err.message,
      });
  }
});

app.listen(PORT, () => console.log(`App listening at http://localhost:${PORT}`));
