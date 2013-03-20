default: run

run:
	@node-dev index.js

test:
	@\
	captain syncdb --force &&\
	captain loaddata data &&\
	mocha -G -b --recursive

.PHONY: test run
