npm run clean
npm run build:ts
cp package.json ./dist/employee-directory
cp ./build/resources/*.json ./dist
cp ./src/employee-directory/*.json ./dist/employee-directory
cd ./dist/employee-directory
npm install --production
