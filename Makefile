default: run

run:
	@node-dev index.js

test:
	@./bin/captainjs syncdb --force && ./bin/captainjs loaddata data && mocha -G -b --recursive

.PHONY: test run
