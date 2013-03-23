default: run

run:
	@node_modules/.bin/node-dev index.js

test:
	@\
	captain syncdb --force &&\
	captain load_data data &&\
	node_modules/.bin/mocha -G -b --recursive

docs:
	@bin/docs.js

.PHONY: test run docs
