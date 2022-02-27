#!/bin/bash

file=test-test.idr

# read user input + test code combination from stdin > $file
cat - > $file

# check idris source file
idris2 $file --check

if [ $? -eq 1 ]; then
  rm $file
  exit 1
fi

# run idris with tests
idris2 $file --exec main

rm $file