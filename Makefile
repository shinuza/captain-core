default: run

run:
	./lib/cli.js syncdb --force && mocha -G -R spec
