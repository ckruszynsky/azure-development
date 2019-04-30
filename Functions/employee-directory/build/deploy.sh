
echo "Enter the name of the Azure Function app to deploy the function(s) to"
read -p "  Azure Function App: " azureFunctionApp

# change to the dist folder
cd dist

echo ""
echo "Deploying Azure Functions with the Azure Functions Core Tools"
func azure functionapp publish $azureFunctionApp --force

# get back to the root folder
cd ..

echo ""
echo "Azure Function deployed to app '$azureFunctionApp'"