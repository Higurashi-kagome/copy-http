# Copy HTTP Extension

[简体中文](./README.zh.md) | [Chrome][aihjaemhdhnklanahidclalbdeilkleo]

A browse extension for copying HTTP request and response data. By setting rules, you can automatically copy request headers, response headers, URLs, request bodies, and request parameters to the clipboard.

> Icon is from [iconfont | sshhaa][iconfont].

## Features

- Copy request headers
- Copy response headers
- Copy URLs
- Copy request bodies
- Copy request parameters
- Support regex and JSONPath matching
- Group rules management

## Development

First, clone the repository and install dependencies, then run the development server:

```bash
pnpm install
pnpm dev
# or
npm install
npm run dev
```

Open your browser and load the appropriate development build. For example, if you are developing for Chrome with manifest v3, use: `build/chrome-mv3-dev`.

The extension is built with [Plasmo](https://docs.plasmo.com/) framework. For more details, please refer to the official documentation.

## Building for Production

Run the following command:

```bash
pnpm build
# or
npm run build
```

This will create a production bundle that's ready to be zipped and published to the stores.

## Privacy

- All data is processed locally in your browser
- No data is uploaded to any server
- Open source code, welcome to inspect and contribute

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT

## Support

If you have any questions or suggestions, please open an issue on GitHub. 

[aihjaemhdhnklanahidclalbdeilkleo]: https://chromewebstore.google.com/detail/copy-http/aihjaemhdhnklanahidclalbdeilkleo
[iconfont]: https://www.iconfont.cn/user/detail?uid=43820&nid=Tm5ezG3YNRej