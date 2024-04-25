import { build } from 'esbuild';
import { watch } from 'chokidar';
import fg from 'fast-glob';
import fse from 'fs-extra';
import postCSS from 'esbuild-postcss';
import path from 'path';
import liveServer from 'live-server';
import livereload from 'livereload';

var params = {
	port: 8181, // Set the server port. Defaults to 8080.
	host: '0.0.0.0', // Set the address to bind to. Defaults to 0.0.0.0 or process.env.IP.
	root: './dist', // Set root directory that's being served. Defaults to cwd.
	open: false, // When false, it won't load your browser by default.
	watch: './dist/*',
	ignore: 'scss,my/templates', // comma-separated string for paths to ignore
	file: 'index.html', // When set, serve this file (server root relative) for every 404 (useful for single-page applications)
	wait: 3000, // Waits for all changes, before reloading. Defaults to 0 sec.
	// mount: [['/components', './node_modules']], // Mount a directory to a route.
	logLevel: 2, // 0 = errors only, 1 = some, 2 = lots
	middleware: [
		function (req, res, next) {
			next();
		},
	], // Takes an array of Connect-compatible middleware that are injected into the server middleware stack
};

class Compiler {
	/** @private */
	constructor({ env }) {
		this.env = env;
	}

	startLiveServer(openBrowser) {
		liveServer.start({ ...params, ...{ open: openBrowser } });
	}

	stopLiveServer() {
		liveServer.shutdown();
	}

	/** @private */
	buildConfig() {
		return this.env === 'dev'
			? {
					define: { 'process.env.NODE_ENV': '"development"' },
					minify: false,
					target: 'esnext',
			  }
			: {
					define: { 'process.env.NODE_ENV': '"production"' },
					minify: true,
					target: 'es2020',
			  };
	}

	/** @private */
	async copyStaticAssets() {
		for (const src of await fg(['./src/**/*'], {
			ignore: ['./src/**/*.{ts,tsx,css}'],
			onlyFiles: true,
		})) {
			await fse.copy(src, src.replace(/^\.\/src\//, './dist/'));
		}
	}

	/** @private */
	async buildTailwind() {
		await build({
			entryPoints: ['./src/css/tailwind.css'],
			outfile: './dist/style.css',
			bundle: true,
			minify: false,
			external: ['*.svg'],
			logLevel: 'info',
			plugins: [postCSS()],
		});
	}

	/** @private */
	async buildTypeScript() {
		await build({
			entryPoints: ['./src/index.tsx'],
			bundle: true,
			outfile: './dist/index.js',
			platform: 'browser',
			format: 'iife',
			charset: 'utf8',
			logLevel: 'info',
			...this.buildConfig(),
		});
	}

	async build() {
		await fse.emptyDir('./dist');
		await Promise.all([
			this.copyStaticAssets(),
			this.buildTailwind(),
			this.buildTypeScript(),
		]);
	}

	async watch() {
		watch(['./src/**/*.*'], {
			persistent: true,
		}).on('all', async (event) => {
			if (event === 'change' || event === 'unlink') {
				this.stopLiveServer();
				await this.build()
					.then(() => {
						this.startLiveServer(false);
					})
					.catch((err) => console.error(err));
			}
		});
	}
}

const [, , mode, env] = process.argv;
const compiler = new Compiler({ env: env });

await compiler.build();

if (mode === 'watch') {
	compiler.watch();
}

compiler.startLiveServer(true);

const lrserver = livereload.createServer({ debug: true });
lrserver.watch(path.join(process.cwd(), '/dist'));
lrserver.alert('New changed');
