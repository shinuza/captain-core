default: run

SETTINGS = `pwd`/settings_test.js

run:
	@CAPTAINJS_SETTINGS=$(SETTINGS) node-dev index.js

test:
	@\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captainjs syncdb --force &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) ./bin/captainjs loaddata data &&\
	CAPTAINJS_SETTINGS=$(SETTINGS) mocha -G -b --recursive

.PHONY: test run
