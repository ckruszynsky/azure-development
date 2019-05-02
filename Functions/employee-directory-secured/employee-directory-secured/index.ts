import {
    Context,
    HttpMethod,
    HttpRequest,
    HttpResponse,
    HttpStatusCode
} from 'azure-functions-ts-essentials';



import jwt = require('jsonwebtoken');
import employeesDb = require('./employees.json');


/** 
  * Get a specific item
  */

const getOne = (employeeId: any) => {
    const employee = employeesDb.find((employee) => {
        return (employee.id == employeeId)
    });
    return {
        status: HttpStatusCode.OK,
        body: employee
    };
};

/**
 * Get All items
 */
const getMany = () => {
    return {
        status: HttpStatusCode.OK,
        body: employeesDb
    };
};

/**
* Add Employee
*/
const insertOne = (employeeToAdd) => {
    //push the employee on the collection 
    const newEmployees = employeesDb;
    newEmployees.push(employeeToAdd);

    //return collection back 
    return {
        status: HttpStatusCode.OK,
        body: newEmployees
    };
};

const decodedValidToken = (accessToken: string, context:Context) => {
    //public key 
    //retrieved from https://login.microsoftonline.com/common/.well-known/openid-configuration
    //pulled-from url listed at key : jwks_uri
    //https://login.microsoftonline.com/common/discovery/keys
    //then match the token from your request to the kid x5t values

    const key: string = '-----BEGIN CERTIFICATE-----\nMIIDBTCCAe2gAwIBAgIQWcq84CdVhKVEcKbZdMOMGjANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTE5MDMxNDAwMDAwMFoXDTIxMDMxNDAwMDAwMFowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBANGnwmoj3f8Zf3sGRnzpMSsGD3yOBH7tAjn82oyv4J74lpO8N0fvPA5m9I9uA0p9alUd6bQpwNfkFH1DMob5fKU+fre6EZCzT86dIVVfnQBt2aDGkhDFtMGqbIQOi1RkTqQZ3A5nOuocefrd3jhQNuH4in0Ir9kybYd2PY4R5y3uxgTqKJlmMf6SYhBt5oWBSLe7IWhMDXBI6N+L69Vls0ZvA/IKII6yVndZqMnhn7Vi8736fXu/UMB2Cb/dO70Gxa0+y2LsvIO/kacbo4LpsNpsewnsHAmV8D4mfq2jNwKdRYSDYhqXeZm22KxQwxSFgI1j1GOijb17XNuMlH2a+DECAwEAAaMhMB8wHQYDVR0OBBYEFIkZ5wrSV8lohIsreOmig7h5wQDkMA0GCSqGSIb3DQEBCwUAA4IBAQAd8sKZLwZBocM4pMIRKarK60907jQCOi1m449WyToUcYPXmU7wrjy9fkYwJdC5sniItVBJ3RIQbF/hyjwnRoIaEcWYMAftBnH+c19WIuiWjR3EHnIdxmSopezl/9FaTNghbKjZtrKK+jL/RdkMY9uWxwUFLjTAtMm24QOt2+CGntBA9ohQUgiML/mlUpf4qEqa2/Lh+bjiHl3smg4TwuIl0i/TMN9Rg7UgQ6BnqfgiuMl6BtBiatNollwgGNI2zJEi47MjdeMf8+C3tXs//asqqlqJCyVLwN7AN47ynYmkl89MleOfKIojhrGRxryZG2nRjD9u/kZbPJ8e3JE9px67\n-----END CERTIFICATE-----';
    try{
        context.log.info(`Validating access token`);
        // decode & verify token signed by AzureAD
        return jwt.verify(accessToken, key);
    }
    catch(error){
        context.log.error(`Error decoding Token: ${error}`)
    }    
}




/**
  * Azure Function called by the runtime
  * 
  * @export
  * @param {Context} Context
  * @param {HttpRequest} req
  * @param {Promise<any>}
  */
export async function run(context: Context, req: HttpRequest): Promise<any> {
    context.log.info("Starting Request");
    let response: any;
    const employeeId = req.params
        ? req.params.employeeId
        : undefined;

    let isValidRequest: boolean = false;
    let hasEmployeeReadScope: boolean = false;
    let hasEmployeeWriteScope: boolean = false;
    let isUser: boolean = false;
    const authHeader: string = req.headers.authorization;

    context.log.info(`Retrieved AuthHeader: ${authHeader}`);
    try {
        const accessToken = authHeader.replace('Bearer ','');
        context.log.info(`Decoding Token: ${accessToken}`);
        const decodedToken = (decodedValidToken(accessToken,context) as any);

        context.log.info(`Reading scopes from token`);
        const scopes: string = (decodedToken.scp as string);

        //check for read & write operations
        hasEmployeeReadScope = (scopes.indexOf('EmployeeDirectory.Read') >= 0)
        hasEmployeeWriteScope = (scopes.indexOf('EmployeeDirectory.Write') >= 0)
        isValidRequest = true;
    }
    catch (error) {
        isValidRequest = false;

        switch (error.name) {
            case 'NotBeforeError':
                response = {
                    status: HttpStatusCode.Unauthorized,
                    body: {
                        message: `${error.message} : ${error.date}`
                    }
                };
                break;
            case 'TokenExpiredError':
                response = {
                    status: HttpStatusCode.Unauthorized,
                    body: {
                        message: `${error.message} : ${error.date}`
                    }
                };
                break;
            case 'JsonWebTokenError':
                response = {
                    status: HttpStatusCode.Unauthorized,
                    body: {
                        message: `${error.message} : ${error.date}`
                    }
                };
                break;
            default:
                response = {
                    status: HttpStatusCode.Unauthorized,
                    body: `Error decoding & validating jwt : ${error.message}`
                }
        }
    }


    if (isValidRequest) {

        switch (req.method) {
            case 'GET':
                if(hasEmployeeReadScope){
                    response = employeeId ? getOne(employeeId) : getMany();
                }else{
                    response = {
                        status: HttpStatusCode.Unauthorized,
                        body: {
                            message: 'Insufficent permissions to retrieve employees. Missing scope EmployeeDirectory.Read'
                        }
                    }
                }
                break;
            case 'POST':
                if(hasEmployeeWriteScope){
                    response = insertOne(req.body);
                }
                else{
                    response = {
                        status: HttpStatusCode.Unauthorized,
                        body: {
                            message: 'Insufficent permissions to write to employees. Missing scope EmployeeDirectory.Write'
                        }
                    }
                }
                break;

            default:
                response = {
                    status: HttpStatusCode.BadRequest,
                    body: {
                        error: {
                            type: 'not_supported',
                            message: `Method ${req.method} not supported.`
                        }
                    }
                };
        }
    }
    //ensure
    //-response is of type application/json
    //-CORS configured for calling domain
    response.headers = {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Credentials': 'true'
    };

    context.res = response;

    Promise.resolve();
}

