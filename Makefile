default: test

test:
	@./bin/captainjs syncdb --force && ./bin/captainjs loaddata data && mocha -G -b --recursive

.PHONY: test