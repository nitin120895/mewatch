:: build appxbundle
msbuild bin\app\pub\MassiveAxisXBox.jsproj /t:Rebuild /p:Configuration=Release;Platform=x64;AppxPackageDir=..\..\AppPackages
