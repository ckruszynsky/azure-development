import {
    Context,
    HttpMethod,
    HttpRequest,
    HttpResponse,
    HttpStatusCode
} from 'azure-functions-ts-essentials';



import jwt  from 'jsonwebtoken';
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

const decodedValidToken = (accessToken: string) => {
    //public key 
    //retrieved from https://login.microsoftonline.com/common/.well-known/openid-configuration
    //pulled-from url listed at key : jwks_uri
    //https://login.microsoftonline.com/common/discovery/keys
    //then match the token from your request to the kid x5t values

    const key: string = '-----BEGIN CERTIFICATE-----\nMIIDBTCCAe2gAwIBAgIQV68hSN9DrrlCaA3NJ0bnfDANBgkqhkiG9w0BAQsFADAtMSswKQYDVQQDEyJhY2NvdW50cy5hY2Nlc3Njb250cm9sLndpbmRvd3MubmV0MB4XDTE4MTExMTAwMDAwMFoXDTIwMTExMTAwMDAwMFowLTErMCkGA1UEAxMiYWNjb3VudHMuYWNjZXNzY29udHJvbC53aW5kb3dzLm5ldDCCASIwDQYJKoZIhvcNAQEBBQADggEPADCCAQoCggEBALvfCr6FB37Ns9mCcn5Cc2hhWDOfHg9HqR3xE08DQ5egC/3E3zpJXMTOI6y1r1aqqdrB2h9IBaWD8qLzfv2pJhP+H5HNFcP8BjOYwz/o5zidbwb2xaBe7gQMuK95Z9nstT6BlIaZF3Q2sISH3QG3O1i7cqKRzVkFyN9+q14sI73Iy/HR4YnrwzpLbALIpQAz+cCU9Jck4nzjT2Tqvl1gsPRbVwEK+w54jgubg7lGi9JjNVCQoYgqw5hTgH+gjXbtksC4p12GrqjPTkRJSmBAoaBH4udX3LJpbJ+JrTT5MbLb0eziYiQab5OxS3omgbTJ7Ducd9Az4K4QGoK1Z9yGikUCAwEAAaMhMB8wHQYDVR0OBBYEFGWLmYFSm5Exg9VcAGSg5sFE1mXgMA0GCSqGSIb3DQEBCwUAA4IBAQB0yTGzyhx+Hz2vwBSo5xCkiIom6h7b946KKiWvgBLeOvAuxOsB15N+bbf51sUfUJ6jBaa1uJjJf27dxwH0oUe2fcmEN76QSrhULYe+k5yyJ7vtCnd6sHEfn9W6iRozv0cb48tESOTlFuwbYDVW+YZxzM9EQHC32CjugURzuN9/rf6nJ9etSeckRMO8QPqyIi4e5sGSDYExxNs7J4prhIbtYT4NRiqc4nWzA/p5wSYOUgAZMSTLD/beSI81UN1Ao9VBBJu3v83d62WL3zHSbpUwtG/utNhSi/n/7Q94claEWJVhBx6LiA1hrU6YZkjRGqBOrWIZkSkh75xW6Xujocy4\n-----END CERTIFICATE-----';

    // decode & verify token signed by AzureAD
    return jwt.verify(accessToken, key);
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
    let response: any;
    const employeeId = req.params
        ? req.params.employeeId
        : undefined;

    let isValidRequest: boolean = false;
    let hasEmployeeReadScope: boolean = false;
    let hasEmployeeWriteScope: boolean = false;
    let isUser: boolean = false;
    const authHeader: string = req.headers.authorization;

    try {
        const decodedToken = decodedValidToken(authHeader.replace('Bearer', '') as any);
        const scopes: string = (decodedToken.scp as string);

        //check for read & write operations
        hasEmployeeReadScope = (scopes.indexOf('EmployeeDirectory.Read') >= 0)
        hasEmployeeWriteScope = (scopes.indexOf('EmployeeDierectory.Write') >= 0)

        //check if it's specific user
        isUser = (decodedToken.upn.indexOf('@foobar.com') !== -1);

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

