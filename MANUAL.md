# User's guide to Argus
- [About Argus](#what-is-argus)
- [Log in](#log-into-argus)
  - [Using username and password](#login-using-username-and-password)
  - [Using Feide](#login-using-feide)
- [Manage alarms](#work-with-alarms-in-argus)
- [Customize notifications](#customize-alarm-notifications-in-argus)
- [Manage notification time](#manage-time-for-when-to-receive-notifications-in-argus)
  - [What is timeslot](#what-is-timeslot-in-argus)
  - [What is recurrence](#what-is-recurrence-in-argus)
  - [Access your timeslots](#access-your-timeslots)
  - [Add recurrence](#add-new-recurrence)
  - [Edit recurrence](#edit-recurrence)
  - [Delete recurrence](#delete-recurrence)
  - [Add timeslot](#add-new-timeslot)
  - [Edit timeslot](#edit-existing-timeslot)
  - [Delete timeslot](#delete-timeslot)
- [Manage contact details](#manage-your-contact-details-in-argus)
  - [Access your contact details](#access-your-contact-details-in-settings)
  - [Add phone number](#add-new-phone-number-in-settings)
  - [Edit phone number](#edit-existing-phone-number-in-settings)
  - [Delete phone number](#delete-phone-number-in-settings)
- [Log out](#log-out-from-argus)

## What is Argus?
Argus is an _alert aggregator_ designed for storing and managing alerts from different monitoring systems at one place.
Argus is created for **ease of alarm management** and **customizable alarm notifications**.  

## Log into Argus
Log in and start using Argus at **/login**

### Login using username and password
1. Fill out _username_ and _password_

2. Press `LOGIN`

   <img height="170" src="../../Screenshot 2022-09-07 at 14.11.27.png" width="354"/>
### Login using Feide
1. Press `LOGIN WITH FEIDE`

   <img src="../../Screenshot 2022-09-07 at 13.56.18.png" width="354" height="310"/>

2. Select account you want to log in with

   <img height="461" src="../../Screenshot 2022-09-07 at 13.56.03.png" width="354"/>

3. Fill out _feide-username_ and _password_

   <img src="../../Screenshot 2022-09-07 at 13.55.48.png" width="354" height="740"/>

4. Press `Log in`

   <img height="125" src="../../Screenshot 2022-09-07 at 13.59.17.png" width="354"/>

5. Continue with preferred method of 2-factor Feide authentication

## Work with alarms in Argus

## Customize alarm notifications in Argus

## Manage time for when to receive notifications in Argus
Add, edit or delete timeslots in _Timeslots_.

### What is timeslot in Argus
Timeslot is a collection of one or more recurrences with a meaningful name. Saved timeslots are used when customizing alarm notifications. Each timeslot represents a window or several windows of time for when it is OK to receive alarm notifications.

### What is recurrence in Argus
Recurrence is a building block of each timeslot. Each recurrence represents a time range on selected weekdays for when it is OK to receive alarm notifications.
Time range can either be:
* a whole weekday, 
* or a window of time

Each recurrence has only one time range, and it applies to all days that are selected in given recurrence. 

For example, in this timeslot alarm notifications are allowed from 4 p.m a.m to 8 a.m on business days, and all hours on weekends:
    ![](../../Screenshot 2022-09-08 at 11.57.49.png)



### Access your timeslots
1. Press `TIMESLOTS` in header
### Add new recurrence
Each timeslot has at least one recurrence by default. Add more recurrences if your timeslot needs more than one.
1. [Go to your timeslots](#access-your-timeslots).
2. Press `ADD RECURRENCE` either in _Create New Timeslot_ box, or in one of your existing timeslots.

    ![](../../Screenshot 2022-09-08 at 10.50.13.png)

### Edit recurrence
1. [Go to your timeslots](#access-your-timeslots).
2. Modify one of existing recurrences either in _Create New Timeslot_ box, or in one of your existing timeslots:
   * If needed, change _start time_ either by typing new value, or by pressing on calendar icon:
     ![](../../Screenshot 2022-09-08 at 12.03.51.png)
   * If needed, change _end time_ either by typing new value, or by pressing on calendar icon:
     ![](../../Screenshot 2022-09-08 at 12.05.42.png)
   * Check _All day_ if you want recurrence to be from 00:00 a.m. to 11:59 p.m.. Note that if _All day_ is checked, you do not need to provide _start-_ and _end time_.
     ![](../../Screenshot 2022-09-08 at 12.07.27.png)
   * If needed, change day(s):
     1. Open drop-down menu.
        ![](../../Screenshot 2022-09-08 at 12.05.42 2.png)
     2. Select/de-select days for this recurrence by clicking on them once. Selected days are highlighted in light-yellow.
        ![](../../Screenshot 2022-09-08 at 12.08.24.png)
     3. Click away anywhere outside the drop-down menu.

### Delete recurrence
1. [Go to your timeslots](#access-your-timeslots).
2. Press `REMOVE` inside one of existing recurrences either in _Create New Timeslot_ box, or in one of your existing timeslots:

    ![](../../Screenshot 2022-09-08 at 12.20.00.png)
### Add new timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Go to _Create New Timeslot_ box.
    * In full-screen view it is visible by default at the top:
      ![](../../Screenshot 2022-09-08 at 12.29.11.png)
    * In mobile-view, press button with _pencil-icon_ at the top to unfold _Create New Timeslot_ box:
      ![](../../Screenshot 2022-09-08 at 12.28.24.png)
3. Type in a (meaningful) timeslot name.
    ![](../../Screenshot 2022-09-08 at 12.35.51.png)
4. [Add another recurrence(s)](#add-new-recurrence) if needed.
5. [Edit recurrence(s)](#edit-recurrence) if needed.
6. [Remove recurrence(s)](#delete-recurrence) if needed.
7. Press `CREATE`.
   ![](../../Screenshot 2022-09-08 at 12.35.51 2.png)
8. _Create New Timeslot_ box will refresh to default and your newly created timeslot will appear at the bottom of the timeslot list. Note that existing timeslots have a dark border at the top.
   ![](../../Screenshot 2022-09-08 at 12.41.07.png)

### Edit existing timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Modify one of your existing timeslots:
   * Change name if needed.
     ![](../../Screenshot 2022-09-08 at 12.47.38.png)
   * [Add another recurrence(s)](#add-new-recurrence) if needed.
   * [Edit recurrence(s)](#edit-recurrence) if needed.
   * [Remove recurrence(s)](#delete-recurrence) if needed.
3. Press `SAVE`. Note that `SAVE`-button is inactive if no changes were made. `SAVE`-button is also inactive if some changes are invalid. In this case error messages inside the timeslot box will help you. 
    ![](../../Screenshot 2022-09-08 at 12.49.29.png)
    ![](../../Screenshot 2022-09-08 at 12.53.44.png)

### Delete timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Press `DELETE` inside one of existing timeslots. Note that `DELETE`-button is disabled in _Create New Timeslot_ box.
    ![](../../Screenshot 2022-09-08 at 12.56.02.png)


## Manage your contact details in Argus
Add, edit or delete phone numbers in your settings. Phone numbers that are present in your settings can be used when customizing notifications.
### Access your contact details in settings
1. Click on _user icon_ in header.
2. Click on `Settings` in drop-down menu.

    ![](../../Screenshot 2022-09-07 at 14.18.11.png)
    
### Add new phone number in settings
1. [Go to your contact details](#access-your-contact-details-in-settings)
2. Type in an existing phone number. Phone number **has to include land code.**

    ![](../../Screenshot 2022-09-07 at 14.46.13.png)
3. Press `CREATE`.

    ![](../../Screenshot 2022-09-07 at 14.46.13 2.png)

### Edit existing phone number in settings
1. [Go to your contact details](#access-your-contact-details-in-settings)
2. Modify one of existing phone numbers.

   ![](../../Screenshot 2022-09-08 at 09.48.43.png)
3. Press `SAVE`.

   ![](../../Screenshot 2022-09-08 at 09.48.43 2.png)

### Delete phone number in settings
1. [Go to your contact details](#access-your-contact-details-in-settings)
2. Press `DELETE` by one of your saved phone numbers.

   ![](../../Screenshot 2022-09-08 at 09.54.43.png)


## Log out from Argus
1. Click on _user icon_ in header.
2. Click on `Logout` in drop-down menu.

   ![](../../Screenshot 2022-09-07 at 14.18.11 2.png)



