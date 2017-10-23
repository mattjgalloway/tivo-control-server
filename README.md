# tivo-control-server

Expose an HTTP(S) server for your TiVo DVR(s).

## Setup

  1. Copy `example-config.json` to `config.json`.
  2. Open `config.json`.
  3. Edit the `tivos` section to include the TiVo(s) that you would like to control.
  4. Run `node generate_oauth.js`.
  5. Copy the client ID and client secret into `config.json`.
  6. In `config.json`, set your desired username, password and redirect URIs.

### SSL

If you would like the server to use SSL, then add the following to `config.json`:

```
"ssl": {
  "key": "key.pem",
  "cert": "cert.pem",
  "passphrase": "password"
},
```

Then use the following command to create a key and self-signed certificate:

```
openssl req -x509 -newkey rsa:2048 -keyout key.pem -out cert.pem -days 365
```

## API

* GET `/devices`: Fetch the list of devices.
* GET `/device/:deviceId/state`: Fetch the power state of the device with ID `:deviceId`.
* POST `/device/:deviceId/state`: Set the power state of the device with ID `:deviceId`.
* GET `/device/:deviceId/channel`: Fetch the channel of the device with ID `:deviceId`.
* POST `/device/:deviceId/channel`: Set the channel of the device with ID `:deviceId`.
