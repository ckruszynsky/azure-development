#Azure CLI Tool
Before getting started, you should install the Azure CLI Tool. You can download the executable from the link below : 

[Azure CLI Tools Download](https://docs.microsoft.com/en-us/cli/azure/install-azure-cli?view=azure-cli-latest)

Once you have installed the CLI tools you, can then run the following command in the command prompt:  `az` as this will list all of the available commands that you can run. 

### Login
Before running most commands you must login to Azure. You can do this by running the: `az login ` command. 

If you are running on windows you can use the windows credential manager to store and retrieve your credentials without having to re-enter them everytime. 

[Click here for more info on using the windows credential manager](UsingWindowsCredentialManager.md)


Once you have logged in, you will see a list of one or more json objects that will be displayed. These objects contain your subscription information and which will be used when running commands in the CLI tool.

You can also see this information at anytime by running: ` az account list ` to see a list of your azure subscriptions. 

### Setting your subscription to be used 
To set the subscription you wish to use when running commands in the CLI tool. Run the following command :

```powershell 
  az  account set -s "<Name of your subscription>"
```

## Interactive Mode
Run ` az interactive ` to enter the interactive mode. This mode will give you auto-completion and more information for the commands being ran. 


