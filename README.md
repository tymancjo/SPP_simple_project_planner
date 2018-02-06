# SPP_simple_project_planner
Simple Project Planner - Gantt based planning tool in JS

Tool for simple Task & Time planner 
version: 0.3 (I think)

live version: http://tomasztomanek.pl/pub/spp/

video demo: 
https://youtu.be/nEgHjVBuFh0
https://youtu.be/0YB62mltaMs

## short story:

I never find myself very into typical Project Management apps like MS Project. So having a bit of time I put together very simple app in JS/HTML/CSS that helps plan task in very visual way. It's based on planning tasks in week by week 'resolution'.

## TODO's / Feature Request List
+ timeline as string - for easy filtering - done
+ Always jump with edit selection to pasted task
+ Load/Save/Console available also in mapView
+ Make vie mode selection presistent with load/save/console operations
+ Batch edit of tasks
+ mapView fit to screen height or Fix task height option
+ Master Filtering with many strings (comma separated)
+ Task height update when fultering applayed - done
+ map View top grig FW number shos date on hover
+ Add refresh view to map View toolbar

## Quick Use Guide
### Main working window
+ You click somwhere you add task
+ You can move it on timeline[<][>], shrink/extend [-][+]
+ if it have a task abole you can link it to 'parent' [!] - this will make it start after previous end
+ if it's linked you can break the link [#]
+ if you click the task bar you have a edit window, where you can do all the above and edit manualy data, or delete task
+ on the left is a drawer - click the bar with |||
  + you can open saved file
  + you can save the file you have (it's saved as a CSV file with just list of tasks)
  + The text console allows to paste data (i.e. from excel) and analyze it or to bring all your work to it and than allows you to copy from it (if you need it for some reason)
+ on the top is a toolbar
  + you can zoom out the entire Gantt to get a better look
  + you can change the timescale (shrink/extend all in X directon)
  + you can activate the "map view"

### Map View
This working mode was a key idea - to have a one look to entire project. Here we can do tasks adjustmens (by the same edit window like in main working view)
+ A single page overview of the all tasks
+ created as place for make a picture for presentations etc.
+ allows some modification work
  + you click on task and you get the same Modification Window as in Main working window
  + the changes are reflected live on the map view
  + You cannot Add task in Map View (at least for now)
  + You have a quick adjust menu (right top - hover there) where you can:
    - Adjust the text size
    - Hide/show the text
    - Use global filter to show display only some tasks
    - get back to Main Work View

### Map View Global FIlter

This text input box allows fo display only tasks that contain the entered text in the name, owner, timeline etc.
It's case sensitive.



## documentation
I'm on it - will be here.
