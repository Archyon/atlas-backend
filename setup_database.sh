#!/bin/bash

# create new database
npx prisma migrate dev --name init

# load db scheme changes
npx prisma db push
