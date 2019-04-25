# Azure Functions Development

## Required Packages
Before beginning to develop Azure functions. The first thing you will need to install is the Azure Functions Core Tools v2.

` npm i -g azure-functions-core-tools --unsafe-perm true `


## Getting Started

After installing the package, open the command prompt in the directory you are working from; then run the following command : ` func init `

If you would like to skip creating a local git repo pass the -n switch to the init statement : ` func init -n `

Next execute ` func new ` to start the function creation wizard where you will be asked to select a language, template and provide the function's name. 

After running the ` func new ` command, start the function by running ` func start  `. This command will startup the function App locally and provide you with the 
url which will trigger the function. 

When you invoke the function, the function will request data from ` req ` parameter and look for the `name` parameter in the request's query or body. 

If it is found it will return a OK 200 Status and will add text to the response `context.res.body`

Invoking the function with the name parameter set to foo : 

` http://localhost:7071/api/HttpTriggerJS?name=%22foo%22 `

outputs the following message in the body : 

` Hello "foo" `

If the name parameter is not located you will receive a 400 status and a message to provide a name for the parameter. 

The context parameter provides us with a runtime's context object which can be used to pass and receive data from the function and to communicate with the runtime. 

The context object can be used for reading data and setting data from bindings, writing logs, and using the ` context.done ` callback when the exported function is synchronous. 

The context object is always the first parameter to a function : 

```javascript
module.exports = async function (context, req) {
    //function logic goes here    
}
```
```javascript
//if your function is not async 
module.exports = function(context,req){
    //logic goes here
  context.done(); //this must be called on synchronous functions
}
```
## context.Req object ##
The `context.req` (request) object has the following properties:

| Property    |  Description |
|-------------|--------------|
| _body_      | contains the body of the request |
| _headers_   | contains the request headers | 
| _method_    | HTTP method of the request |
| _originalUrl_       | The URL of the request |
| _params_    | object contains the routing parameters of the request |
| _query_     | contains the query parameters  |
| _rawBody_   |  body of the message as a string |

## context.Res object
The `context.res` (response) object has the following properties

| Property    |  Description |
|-------------|--------------|
| _body_      | contains the body of the response |
| _headers_   | contains the headers of the response |
| _isRaw_     | indicates that formatting is skipped for the response |



## context.bindings property

The context bindings property returns a named object that contains all of your input and output data. 

For example, the following bindings are defined in the function.json file
```json
{
  "bindings": [
    {
      "authLevel": "function",
      "type": "httpTrigger",
      "direction": "in",
      "name": "req",
      "methods": [
        "get",
        "post"
      ]
    },
    {
      "type": "http",
      "direction": "out",
      "name": "res"
    }
  ]
}
```

In our code we can access the binding named `req` which gives us access to all of the properties of the request which looks like below : 

```json
{
    "method": "GET",    
    "url": "http://localhost:7071/api/HttpTriggerJS?name=%22foo%22",
    "originalUrl": "http://localhost:7071/api/HttpTriggerJS?name=%22foo%22",
    
    "headers": {        
        "cache-control": "max-age=0",        
        "connection": "keep-alive",        
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3", "accept-encoding": "gzip, deflate, br",        
        "accept-language": "en-US,en;q=0.9",
        "cookie": ".AspNet.Consent=yes",
        "host": "localhost:7071",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/73.0.3683.103 Safari/537.36",
        "upgrade-insecure-requests": "1"
    },
    "query": {
        "name": "\"foo\""
    },
    "params": {}
}
```

## context.bindingData Property

Returns a named object that contains trigger metadata and function invocation data (`invocationId`,`sys.methodName`,`sys.utcNow`, `sys.randGuid`)


## context.log method
Allows you to write to the streaming function logs at the default trace level. 

On `contenxt.log`, additional logging methods are available that let you write function logs at other trace levels:


| Method            | Description          |
| ------------------| ---------------------|
| *error(message)*  | writes to error level logging, or lower |
| *warn(message)*   | writes to warning level logging |
| *info(message)*   | writes to info level logging  |
| *verbose(message)*| writes to verbose level logging |


The trave-level threshold for logging can be configured in the host.json file. 

## Writing trace output to the console 

Trace outpus using `console.log` are captured at the Function App Level. This means outputs from `console.log` are not tied to a specific function invocation, and aren't displayed in a specific function's log. They are propagated to Application Insights