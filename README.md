# Columnar

A graphical interface for creating flexbox-based grids. See a [live version](http://akiryk.github.io/projects/columnar/). 

##How to run this project

1. Clone it onto your machine: `git clone https://github.com/akiryk/columnar.git`
2. If you don't already have grunt installed, [get it now](http://gruntjs.com/).
3. cd into the columnar directory
4. Run `npm install` from command line to install grunt modules. 
5. Run `grunt` from command line to start a local server at http://localhost:8000
6. Run `grunt build` to create a build version of the tool, which you can find in /prod.

##Project organization

main.js calls `Controller.init()`, which starts the app. 

##How to use the tools
Select the number of columns you'd like to create with the dragger at the top of the page. Do the same for the gutter width. Check "Prefix Me" or not depending on whether you'd like the output to display CSS-prefixes. Then drag the yellow handles of the columns to create the widths you'd like. Correct HTML and CSS markup will display down below for you to copy and paste.

