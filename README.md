### About:

Starter template using:

-   React

-   ESBuild

-   TypeScript

-   Tailwind CSS

-   ESLint

### Commands:

```bash
npm run build
npm run watch
npm run build:prod
npm run watch:prod
```

### The serve is reload automatically

1. add the `livereload` module after source code changed and rebuild.

> NOTE: you should put the following code to `src/index.html`, otherwise reload won't working.
 
```
    <script>
        document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] +
            ':35729/livereload.js?snipver=1"></' + 'script>')
    </script>
```