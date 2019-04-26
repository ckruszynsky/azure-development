# Using the windows credential manager to login

You can store your credentials using the module: `CredentialManager` in powershell. 

Run the following command in a powershell prompt: 

```powershell
 Install-Module CredentialManager -force
```

Once the module has been installed, you will most likely need to close and re-open the powershell prompt to ensure the module has been loaded. 

Once you have re-opened the window, you can then run the following command to store your credentials to thw windows credential manager :

```powershell
    New-StoredCredential -Target <Some Text> -Username <Your username> -Password <your password>
```
__The target parameter can be any text you'd like but should be something easily remembered as this is what you will use to reference to retrieve the credentials__


Now that you have stored your credentials you can retrieve them by using 
```powershell
Get-StoredCredential -Target <Your Target>
```

Below is a example of logging in with the Azure cli tools using the windows credential manager 

```powershell
 $AzCred = Get-StoredCredential -Target <Your Target>
 
 az login -u $AzCred.UserName 
          -p $AzCred.GetNetworkCredential()

```