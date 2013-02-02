default: run

run:
	./bin/captainjs syncdb --force && mocha -G -b --recursive
