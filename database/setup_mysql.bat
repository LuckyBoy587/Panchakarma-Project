@echo off
echo Setting up MySQL Database for Panchakarma...

echo.
echo Please ensure MySQL is installed and running.
echo You may need to start MySQL service first.
echo.

set /p db_user="Enter MySQL username (default: root): "
if "%db_user%"=="" set db_user=root

set /p db_pass="Enter MySQL password: "

echo.
echo Creating database...
mysql -u %db_user% -p%db_pass% -e "CREATE DATABASE IF NOT EXISTS panchakarma_db;"

echo.
echo Running schema...
mysql -u %db_user% -p%db_pass% panchakarma_db < "..\database\schema.sql"

echo.
echo Database setup complete!
echo.
pause
