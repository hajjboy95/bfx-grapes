Hi,

To run the project;

cd into client and run `npm install`
cd into server and run `npm install`

run the 2 grape servers.

`grape --dp 20002 --aph 40001 --bn '127.0.0.1:20001'` and `grape --dp 20001 --aph 30001 --bn '127.0.0.1:20002'`

run the server by cd'ing into the server and run `node server.js` likewise for the client cd into the `client` dir and `node client.js`

to the tests cd into the `server` dir and run `npm test`

##due to lack of time
1. didnt fully finish the testing suite, could have added more tests for corner cases
2. didnt have a chance to update all clients to sync order books, was thinking of having a pub/sub to keep them all in sync.

3.nodejs isnt great with floats in general could've availed of certain packages to make the handling more reliable
4. Could make the readme nicer 
