default: run

run:
	./lib/cli.js syncdb --force && mocha
