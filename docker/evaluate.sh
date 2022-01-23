#!/bin/bash

file=test-test.idr

# read user input + test code combination from stdin > $file
cat - > $file

# run idris with tests
idris2 $file --exec main

rm $file