default: run

run:
	@node_modules/.bin/node-dev index.js

test:
	@\
	captain syncdb --force &&\
	captain loaddata data &&\
	node_modules/.bin/mocha -G -b --recursive

docs:
	@bin/doc.js

.PHONY: test run docs
