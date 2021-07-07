###YAFS28: Project 2 - movie web site

**Manage User Console**
* User list
  * Name: `frstName + lastName`
  * Username: `unique`
  * Date created: `read only`
  * Session time out: `infinty for admin`
  * Role: `red + crown` for admin `blue + usr` for user
  * Activated: `red + fire` for activated `blue + frost` for non-activated
  * Permissions: `green + check` for true `red + x` for false

* Add new user
  * Validation
    * Check for blank fields
    * Check if username is unique
    * Check if inputs got white spaces
    * Check if first name & last name got numbers
    * Check if inputs under 12 characters long
  * View checkbox checked automatically if create/delete/update is selected 
* Edit user - modal
  * Validation
    * Check for blank fields
  * View checkbox checked automatically if create/delete/update is selected
* Delete user - modal
  * Validation
    * Type in '`delete + $userName`' to activate delete button

