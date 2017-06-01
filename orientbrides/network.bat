@echo on
:loop
ping www.google.com | find "Request timed out" || goto run
goto loop
:run
start chrome http://baidu.com
exit