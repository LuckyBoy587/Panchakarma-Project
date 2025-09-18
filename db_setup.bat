@echo off
echo Setting up MySQL Database for Panchakarma...

echo.
echo Please ensure MySQL is installed and running.
echo You may need to start MySQL service first.
echo.

:: Default values
set "db_user=root"
set "db_pass=root"

echo.
echo Creating database...
mysql -u %db_user% -p%db_pass% -e "CREATE DATABASE IF NOT EXISTS panchakarma_db;"

echo.
echo Running schema...
mysql -u %db_user% -p%db_pass% panchakarma_db < "database\schema.sql"

echo.
echo Database setup complete!
echo.
pause
