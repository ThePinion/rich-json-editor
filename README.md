# rich-json-editor

To remove the unnecessary bundles you can run the following (PowerShell) command in the build directory:
```PowerShell
Get-ChildItem | Where-Object { $_.Name -match "^.*json.*(?:mode|theme)(?!.*(rich_json|-json\.|javascript|sqlserver|css|chrome).*).*$" } | del
```
```sqlserver```, ```json```, ```javascript```, ```chrome``` are the ```modules``` or ```themes``` that will be preserved.

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).
