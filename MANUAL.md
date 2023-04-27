# User's guide to Argus
- [About Argus](#what-is-argus)
- [Log in](#log-into-argus)
  - [Using username and password](#login-using-username-and-password)
  - [Using OAuth 2.0](#login-using-oauth-20-feide-in-the-example-below)
- [Manage alarms](#work-with-alarms-in-argus)
  - [What is an incident](#what-is-an-incident-in-argus)
  - [Access detailed incident view](#access-detailed-incident-view)
  - [Work with table](#work-with-incidents-table)
    - [Change rows per page](#change-how-many-rows-are-shown-per-incidents-table-page)
    - [Navigate table](#navigate-incidents-table)
    - [Change refresh interval](#change-how-often-incidents-table-gets-refreshed)
  - [Filter incidents](#decide-which-incidents-are-shown-in-the-table)
    - [Filter by open/close](#filter-by-openclose-status)
    - [Filter by acknowledgement](#filter-by-acknowledgement-status)
    - [Filter by sources](#filter-by-source-monitoring-system)
    - [Filter by tags](#filter-by-tags)
    - [Filter by severity level](#filter-by-severity-level)
    - [Filter out old incidents](#filter-out-older-incidents)
  - [Work with stored filters](#work-with-stored-filters)
    - [Save filter](#save-current-filter)
    - [Modify filter](#modify-existing-filter)
    - [Apply filter](#apply-existing-filter)
    - [Unselect applied filter](#unselect-applied-filter)
    - [Delete filter](#delete-existing-filter)
  - [Update one incident](#update-one-incident)
    - [Re-open closed (resolved) incident](#re-open-a-closed-resolved-incident)
    - [Close (resolve) incident](#close-resolve-an-incident)
    - [Acknowledge incident](#add-acknowledgement-to-an-incident)
    - [Update ticket](#update-incident-ticket)
      - [Manually add ticket to incident](#manually-add-ticket-url-to-an-incident)
      - [Edit ticket URL](#edit-ticket-url)
      - [Remove ticket from incident](#remove-ticket-url-from-an-incident)
      - [Automatically generate ticket from incident](#automatically-generate-ticket)
  - [Update several incidents](#update-several-incidents-at-a-time)
    - [Re-open incidents](#re-open-closed-resolved-incidents)
    - [Close incidents](#close-resolve-incidents)
    - [Acknowledge incidents](#add-acknowledgement-to-incidents)
    - [Add ticket to incidents](#add-ticket-url-to-incidents)
    - [Remove ticket from incidents](#remove-ticket-url-from-incidents)
- [Customize notifications](#customize-alarm-notifications-in-argus)
  - [About components of notification profiles](#about-components-of-notification-profiles)
  - [About the available notification media](#about-the-available-notification-media)
  - [Access your notification settings](#access-your-notification-profiles)
  - [Add notification profile](#add-new-notification-profile)
  - [Edit notification profile](#edit-existing-notification-profile)
  - [Disable notification profile](#disable-notification-profile)
  - [Delete notification profile](#delete-notification-profile)
- [Manage notification time](#manage-when-to-receive-notifications-in-argus)
  - [What is a timeslot](#what-is-a-timeslot-in-argus)
  - [What is a recurrence](#what-is-a-recurrence-in-argus)
  - [Access your timeslots](#access-your-timeslots)
  - [Add recurrence](#add-new-recurrence)
  - [Edit recurrence](#edit-recurrence)
  - [Delete recurrence](#delete-recurrence)
  - [Add timeslot](#add-new-timeslot)
  - [Edit timeslot](#edit-existing-timeslot)
  - [Delete timeslot](#delete-timeslot)
- [Manage contact details (destinations)](#manage-your-contact-details-destinations-in-argus)
  - [Access your destinations](#access-your-destinations-in-settings)
  - [Add destination](#add-new-destination-in-settings)
  - [Edit destination](#edit-existing-destination-in-settings)
  - [Delete destination](#delete-destination-in-settings)
- [Log out](#log-out-from-argus)

## What is Argus?
Argus is an _alert aggregator_ designed for storing and managing alerts from different monitoring systems at one place.
Argus is created for **ease of alarm management** and **customizable alarm notifications**.

## Log into Argus
Argus supports several login mechanisms:
* _username-password login_
* _federated login with OAuth 2.0_

Log in and start using Argus at **/login**.
<img src="public/screenshots/manual/Screenshot 2023-04-25 at 17.08.07.png"/>

### Login using username and password
1. Fill out _username_ and _password_.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 17.08.37.png"/>

2. Press `LOGIN`.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 17.08.37 copy.png"/>

### Login using OAuth 2.0 (Feide in the example below)
1. Press `LOGIN WITH OAUTH2`.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 17.08.37 copy 2.png"/>

2. Select account you want to log in with.

   <img height="461" src="public/screenshots/manual/Screenshot 2022-09-07 at 13.56.03.png" width="354"/>

3. Fill out _username_ and _password_ and press `Log in`.

   <img src="public/screenshots/manual/Screenshot 2022-09-07 at 13.55.48.png" width="354" height="740"/>

4. Continue with the preferred method for two-factor authentication.

## Work with alarms in Argus
**View**, **filter** and **update** alarms that come to Argus from different sources (monitoring systems).

<img src="public/screenshots/manual/Screenshot 2022-09-08 at 14.18.46.png"/>

You can see all of your monitoring systems that are connected to Argus in the _Sources selector_. Click on the _Sources selector_ and all available monitoring systems will appear in the drop-down menu.

<img src="public/screenshots/manual/Screenshot 2022-09-22 at 09.18.46.png"/>

### What is an incident in Argus
An incident is an alarm that was sent to Argus from a monitoring system of your choice.

Each incident has a _description_ (created by the monitoring system), _start time_, _duration_, _source_ (which monitoring system it came from), _tags_ and _severity level_. An incident may have _end time_, _ticket url_ (associated ticket in an external ticket system).
Incidents may have different status. For example, an incident may be _open_, or _closed_ (resolved). An incident may also be _acknowledged_ (noticed or commented in any way), or not. 
In the detailed incident view below you can get familiar with the above-mentioned attributes of an incident. Note that an incident's event feed is also available in the detailed view. The event feed shows events like _closing_ (resolving), and _acknowledgment_ of an incident.

<img src="public/screenshots/manual/Screenshot 2022-09-08 at 14.28.18.png"/>

Each row in the _Incidents_ table is one alarm. In the table you can see an incident's _start time_, _closed/open status_, whether an incident has at least one _acknowledgement_, _severity level_, _source_ (which monitoring system the incident came from), _description_ (created by the monitoring system) and whether the incident has an associated _ticket url_ (label icon at the very end of the row).

<img src="public/screenshots/manual/Screenshot 2022-09-09 at 08.21.36.png"/>

### Access detailed incident view
* Alternative 1:
  1. Click on an incident row in the _Incidents_ table.
  2. Detailed incident will appear in a pop-up window.
  
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.40.01.png"/>
    
* Alternative 2:
  1. Click on one of the icons under _Actions column_ in the _Incidents_ table.
  
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 08.21.36 copy.png"/>
     
  2. App will redirect you to the incident's page.
  
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.42.33.png"/>

### Work with incidents table

#### Change how many rows are shown per incidents table page
1. Scroll down to the bottom of the _Incidents_ table.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.57.34.png"/>
   
2. Click on the _Rows per page_ drop-down.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.57.34 copy.png"/>
   
3. Select whether you want 10/25/50/100 incidents per page displayed.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.58.16.png"/>

#### Navigate incidents table
1. Scroll down to the bottom of the _Incidents_ table.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 09.57.34.png"/>
   
2. Click on the _right arrow icon_ if you want to go to the next table page.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.05.05 copy.png"/>
   
3. Click on the _left arrow icon_ if you want to go to the previous table page.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.05.05.png"/>


#### Change how often incidents table gets refreshed
1. Click on the _gears icon_ to the right below the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.08.23.png"/>
   
2. Select refresh method in the _Auto Update selector_:

   * If you want **no automatic table updates**, press `NEVER` in the _Auto Update selector_. Note that you will have to refresh the page yourself if you want the table to get updated.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.08.45.png"/>
     
   * If you want the table to update **in realtime**, press `REALTIME` in the _Auto Update selector_.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.08.45 copy.png"/>
     
   * If you want the table to get updated **every couple of seconds**, press `INTERVAL` in the _Auto Update selector_.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.08.45 copy 2.png"/>
      
     * You can see the value of the current refresh interval below the _Incidents table_. The refresh interval is displayed **in whole seconds**.

       <img src="public/screenshots/manual/Screenshot 2022-09-22 at 08.16.17.png"/>
     
     * You can change the refresh interval value in `/src/config.tsx`. The refresh interval is stored **in whole seconds**.
     
       <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.13.15.png"/>


### Decide which incidents are shown in the table
For ease of alarm management you can filter incidents so that only incidents that match all preferred parameters are shown in the _Incidents_ table.

Apply the preferred filter by using the _Filter toolbar_. Argus will remember your filter settings from the last login session, and will use those until you change them.

_Filter toolbar_ is available:
* Below the header in full-screen view.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.30.37.png"/>
  
* In the _Filter Options dropdown_ in mobile view.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.30.18.png"/>


#### Filter by open/close status
* If you only want _open_ incidents to be displayed in the table, press `OPEN` in the _Open State selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35.png"/>

* If you only want _closed_ (resolved) incidents to be displayed in the table, press `CLOSED` in the _Open State selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35 copy.png"/>

* If you want both _open_ and _closed_ (resolved) incidents to be displayed in the table, press `BOTH` in the _Open State selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35 copy 2.png"/>

#### Filter by acknowledgement status
* If you only want _acknowledged_ incidents to be displayed in the table, press `ACKED` in the _Acked selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35 copy 3.png"/>

* If you only want _**un**acknowledged_ incidents to be displayed in the table, press `UNACKED` in the _Acked selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35 copy 4.png"/>

* If you want both _acknowledged_ and _unacknowledged_ incidents to be displayed in the table, press `BOTH` in the _Acked selector_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.35 copy 5.png"/>


#### Filter by source monitoring system
* If you want the table to display only incidents that came from a **specific monitoring system(s)**:
  1. Click on the _Sources input field_.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.58.51.png"/>
  
  2. In the drop-down that appears, you can see all available source systems. Click on the preferred one.

    <img src="public/screenshots/manual/Screenshot 2022-09-09 at 11.18.20 copy.png"/>
  
  3. Press _Enter_. The newly selected _source system_ will appear in the input field.

    <img src="public/screenshots/manual/Screenshot 2022-09-09 at 11.18.51.png"/>
  
  4. Repeat the process if you want to filter by several monitoring systems.

* If you want the table to display incidents from **any monitoring system**, leave the _Sources field_ empty.


#### Filter by tags
* If you want the table to display only incidents that have a **specific tag(s)**:
  1. Type in a _tag_ into the _Tags input field_ in the format `tag_name=tag_value`.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.59.20.png"/>
    
   2. Press _Enter_. The newly added tag will appear in the input field.

  <img src="public/screenshots/manual/Screenshot 2022-09-09 at 11.30.35.png"/>
    
   3. Repeat the process if you want to filter by several tags.
        
* If you want the table to display incidents with **any tags**, leave the _Tags field_ empty.


#### Filter by severity level
The severity level ranges from _1 - Critical_ to _5 - Information_. If you select _max severity level_ to be **5**, all incidents will be displayed in the table. If you select _max severity level_ to be **2**, only incidents with severity **1** and **2** will be displayed in the table.

To change _max severity level_:
1. Open the _Max severity level_ drop-down.

   <img src="public/screenshots/manual/Screenshot 2023-04-21 at 14.01.48.png"/>
   
2. Select the preferred _max severity_ option.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 13.54.58.png"/>

#### Filter out older incidents
Note that you can not save this parameter in [stored filters](#work-with-stored-filters).
1. Click on the _gears icon_ to the right below the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 10.08.23.png"/>
   
2. Open the _Timeframe_ drop-down menu.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.16.33.png"/>

3. Select the preferred option of _report-time-not-later-than_ for the incidents in the table.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.16.50.png"/>


### Work with stored filters
After you [have set the preferred filter parameters for incidents](#decide-which-incident-are-shown-in-the-table), you can save your preferences as a _filter_. Stored _filters_ can be used when [customizing alarm notifications](#customize-alarm-notifications-in-argus).

#### Save current filter
1. [Set the preferred filter parameters](#decide-which-incident-are-shown-in-the-table).
2. Click on the _plus icon_ within the _Filter input field_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.30.58.png"/>
    
3. Give a (meaningful) name to your filter. Press `CREATE`. Note that you can not edit a filter's name after it is created.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.31.38.png"/>

#### Modify existing filter
1. [Make desired changes to filter parameters](#decide-which-incident-are-shown-in-the-table).
2. Click on the _save icon_ within the _Filter input field_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.33.09.png"/>

3. Click on the filter that you want to update, and press `SAVE TO`.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.36.22.png"/>


#### Apply existing filter
1. Click on the _Filter input field_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.46.06.png"/>

2. Click on the preferred filter in the drop-down menu.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.46.20.png"/>

#### Unselect applied filter
1. Click on the _cross icon_ inside the _Filter input field_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.38.17.png"/>

#### Delete existing filter
1. Click on the _gears icon_ inside the _Filter input field_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.30.58 copy.png"/>

2. Select which filter you want to delete by clicking on the _bin icon_.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.33.57.png"/>

3. Confirm deletion.

   <img src="public/screenshots/manual/Screenshot 2022-09-09 at 14.34.24.png"/>


### Update one incident

#### Re-open a closed (resolved) incident
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `OPEN INCIDENT`.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.40.37.png"/>
    
3. Confirm re-opening.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.40.51.png"/>
    

#### Close (resolve) an incident
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `CLOSE INCIDENT`.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.42.03.png"/>
    
3. Press `CLOSE NOW`. Note that you can provide a closing comment if needed.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.46.05.png"/>
    

#### Add acknowledgement to an incident
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `CREATE ACKNOWLEDGEMENT`.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.42.17.png"/>
    
3. Press `SUBMIT`. Note that you can optionally provide an acknowledgement comment and/or a date when this acknowledgement is no longer relevant.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 07.46.26.png"/>



#### Update incident ticket

##### Manually add ticket URL to an incident
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Type/paste in ticket URL into the _Ticket input field_. Note that the URL has to be absolute (full website address).

   <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.28.48.png"/>
    
3. Press `SAVE TICKET URL`.

   <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.29.47.png"/>


##### Edit ticket URL
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `EDIT TICKET URL`.

  <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.32.36.png"/>


3. Type/paste in ticket URL into the _Ticket input field_ and press `SAVE TICKET URL`. Note that the URL has to be absolute (full website address).

  <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.32.52.png"/>



##### Remove ticket URL from an incident
1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `EDIT TICKET URL`.

  <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.32.36.png"/>


3. Remove URL from the _Ticket input field_ and press `SAVE TICKET URL`.

   <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.34.55.png"/>


##### Automatically generate ticket
Argus supports automatic ticket generation from the incident. This feature needs additional configuration. Read more in the [official Argus documentation](https://argus-server.readthedocs.io/en/latest/ticket-systems.html)

1. [Open incident in detailed view](#access-detailed-incident-view).
2. Press `CREATE TICKET`. 

   <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.35.50.png"/>

3. Confirm automatic ticket generation.

     <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.36.21.png"/>


4. When ticket is successfully generated, the _Ticket input field_ is updated with a new ticket URL, and the ticket itself is opened in a new browser tab.

   <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.38.19.png"/>


Please, check that your ticket system configuration in Argus is complete if you get a following error message: 

  <img src="public/screenshots/manual/Screenshot 2023-04-14 at 10.36.40.png"/>

You can read more about ticket system settings [here](https://argus-server.readthedocs.io/en/latest/ticket-systems/settings.html).


### Update several incidents at a time

#### Re-open closed (resolved) incidents
1. Select several incidents in the _Incidents table_ and press `RE-OPEN SELECTED` in the _table toolbar_.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.18.39.png"/>
    
2. Confirm re-opening.

   <img src="public/screenshots/manual/Screenshot 2023-04-17 at 13.47.24.png"/>

#### Close (resolve) incidents
1. Select several incidents in the _Incidents table_ and press `CLOSE SELECTED` in the _table toolbar_.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.19.15.png"/>
    
2. Press `CLOSE NOW`. Note that you can provide a closing comment if needed.

   <img src="public/screenshots/manual/Screenshot 2023-04-17 at 13.48.27.png"/>

#### Add acknowledgement to incidents
1. Select several incidents in the _Incidents table_ and press `ACK` in the _table toolbar_.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.19.15 copy.png"/>
    
2. Press `SUBMIT`. Note that you can optionally provide an acknowledgement comment and/or a date when these acknowledgements are no longer relevant.

   <img src="public/screenshots/manual/Screenshot 2023-04-17 at 13.48.51.png"/>

#### Add ticket URL to incidents
1. Select several incidents in the _Incidents table_ and press `ADD TICKET` in the _table toolbar_.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.20.10.png"/>
    
2. Type/paste in ticket URL into the _Valid ticket URL field_ and press `SUBMIT`. Note that the URL has to be absolute (full website address).

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.20.59.png"/>

#### Edit ticket URL for several incidents
Same process as [adding ticket URL to incidents](#add-ticket-url-to-incidents).

#### Remove ticket URL from incidents
1. Select several incidents in the _Incidents table_ and press `ADD TICKET` in the _table toolbar_.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.20.32.png"/>

2. Leave the _Valid ticket URL field_ empty and press `SUBMIT`.

   <img src="public/screenshots/manual/Screenshot 2022-09-12 at 08.20.59.png"/>




## Customize alarm notifications in Argus
Choose **when**, **where** and **what** alarm notifications you want to receive by creating, editing and deleting _notification profiles_.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.16.54.png"/>


### About components of notification profiles
1. **Timeslot** allows you to customize **when** you want to receive the alarm notifications. You can choose one timeslot per notification profile. Timeslots are reusable across multiple notification profiles.
2. **Filter** allows you to customize **what** alarms (incidents) you want to receive the notifications about. You can choose multiple filters per notification profile. Filters are reusable across multiple notification profiles.
3. **Destination** allows you to customize **where** you want to receive the alarm notifications. You can choose multiple destinations per notification profile. Destinations are reusable across multiple notification profiles. Destinations may be of [different media types](#about-the-available-notification-media).


### About the available notification media
The notification media that are available in Argus by default are:
- SMS
- Email

If you wish to receive notifications to other media, read about configurable media types in the [Argus documentation for notification plugins](https://argus-server.readthedocs.io/en/latest/notifications.html#other-notification-plugins).


### Access your notification profiles
1. Press `PROFILES` in the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 13.53.49 2.png"/>

### Add new notification profile
1. [Go to your notification profiles](#access-your-notification-profiles).
2. Click on the `CREATE NEW PROFILE` button.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.19.09.png"/>

3. Select a timeslot for when to receive notifications in the _Timeslot drop-down_. If the drop-down menu is empty, [create a timeslot](#add-new-timeslot) first.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.19.48.png"/>

4. Select what alarms you want to receive notifications about in the _Filters drop-down_. If the drop-down menu is empty, [create a filter](#save-current-filter) first. Note that if no filter is selected no notification will be sent. You can select multiple filters per notification profile.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.25.51.png"/>

5. Select what destination(s) you want to receive notifications to in the _Destinations drop-down_. If the drop-down menu is empty, create a new destination by clicking on the _Plus_ button first.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.26.37.png"/>

6. Press `CREATE`.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.26.37 copy.png"/>


### Edit existing notification profile
1. [Go to your notification profiles](#access-your-notification-profiles).
2. Change a timeslot for when to receive notifications in the _Timeslot drop-down_ (if needed).

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.39.44.png"/>

3. Change what alarms you want to receive notifications about in the _Filters drop-down_ (if needed).

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.39.44 copy.png"/>

4. Change what destinations(s) you want to receive notifications to in the _Destinations drop-down_ (if needed).

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.39.44 copy 2.png"/>

5. Press `SAVE`.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.39.44 copy 3.png"/>


### Disable notification profile
1. [Go to your notification profiles](#access-your-notification-profiles).
2. Uncheck the _Active checkbox_ inside one of your existing notification profiles.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.41.01.png"/>

3. Press `SAVE`.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.41.01 copy.png"/>



### Delete notification profile
1. [Go to your notification profiles](#access-your-notification-profiles).
2. Press `DELETE` inside one of your existing notification profiles.

  <img src="public/screenshots/manual/Screenshot 2023-04-26 at 14.41.21.png"/>



## Manage when to receive notifications in Argus
Add, edit or delete timeslots in _Timeslots_.

<img src="public/screenshots/manual/Screenshot 2022-09-08 at 14.02.43.png"/>
<img src="public/screenshots/manual/Screenshot 2022-09-08 at 14.03.02.png"/>

### What is a timeslot in Argus
A timeslot is a collection of one or more recurrences with a meaningful name. Saved timeslots can be used when [customizing alarm notifications](#customize-alarm-notifications-in-argus). Each timeslot represents a window (or several windows) of time for when it is OK to receive alarm notifications.

Note that every user has the default timeslot _All the time_:

<img src="public/screenshots/manual/Screenshot 2022-10-06 at 15.01.51.png"/>


### What is a recurrence in Argus
Recurrences are building blocks for timeslots. Each recurrence represents a time range on selected weekdays for when it is OK to receive alarm notifications.
A time range can either be:
* a whole day, 
* or a window of time

Each recurrence has only one time range, and it applies to all days that are selected in a given recurrence. 

For example, in this timeslot with 3 recurrences, alarm notifications are allowed from 4 p.m. to 8 a.m. on business days (note that it is not possible to have a recurrence that goes from one day to the next), and all hours on weekends:

<img src="public/screenshots/manual/Screenshot 2022-09-08 at 11.57.49.png"/>



### Access your timeslots
1. Press `TIMESLOTS` in the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 13.53.49 3.png"/>

### Add new recurrence
Each timeslot has at least one recurrence by default. In the _Create New Timeslot_ box the default recurrence is from 8 a.m. to 4 p.m. on business days. Add more recurrences if your timeslot needs more than one.
1. [Go to your timeslots](#access-your-timeslots).
2. Press `ADD RECURRENCE` either in the _Create New Timeslot_ box, or in one of your existing timeslots.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 10.50.13.png"/>

### Edit recurrence
1. [Go to your timeslots](#access-your-timeslots).
2. Modify one of the existing recurrences either in the _Create New Timeslot_ box, or in one of your existing timeslots:
   * If needed, change _start time_ either by typing a new value or by using the calendar icon.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.03.51.png"/>
     
   * If needed, change _end time_ either by typing a new value or by using the calendar icon.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.05.42.png"/>
     
   * Check _All day_ if you want the recurrence to be from 00:00 a.m. to 11:59 p.m. Note that if _All day_ is checked, you do not need to provide _start-_ and _end time_.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.07.27.png"/>
     
   * If needed, change day(s):
     1. Open drop-down menu.
     
        <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.05.42 2.png"/>
        
     2. Select/de-select days for this recurrence by clicking on them once. Selected days are highlighted in light-yellow.
     
        <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.08.24.png"/>
        
     3. Click away anywhere outside the drop-down menu.

### Delete recurrence
1. [Go to your timeslots](#access-your-timeslots).
2. Press `REMOVE` inside one of the existing recurrences either in the _Create New Timeslot_ box, or inside one of your existing timeslots.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.20.00.png"/>

### Add new timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Go to the _Create New Timeslot_ box.
    * In full-screen view it is visible by default at the top:
   
      <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.29.11.png"/>
      
    * In mobile-view press the button with the _pencil-icon_ at the top to unfold the _Create New Timeslot_ box:
   
      <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.28.24.png"/>
    
3. Type in a (meaningful) timeslot name.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.35.51.png"/>
   
4. [Add another recurrence(s)](#add-new-recurrence) if needed.
5. [Edit recurrence(s)](#edit-recurrence) if needed.
6. [Remove recurrence(s)](#delete-recurrence) if needed.
7. Press `CREATE`.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.35.51 2.png"/>
   
8. The _Create New Timeslot_ box will refresh to default and your newly created timeslot will appear at the bottom of the timeslot list. Note that existing timeslots have a dark border at the top.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.41.07.png"/>

### Edit existing timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Modify one of your existing timeslots:
   * Change the name if needed.
   
     <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.47.38.png"/>
     
   * [Add another recurrence(s)](#add-new-recurrence) if needed.
   * [Edit recurrence(s)](#edit-recurrence) if needed.
   * [Remove recurrence(s)](#delete-recurrence) if needed.
3. Press `SAVE`. Note that the `SAVE`-button is inactive if no changes were made. The `SAVE`-button is also inactive if some changes are invalid. In this case error messages inside the timeslot box will help you.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.49.29.png"/>

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.53.44.png"/>

### Delete timeslot
1. [Go to your timeslots](#access-your-timeslots).
2. Press `DELETE` inside one of the existing timeslots. Note that the `DELETE`-button is disabled in the _Create New Timeslot_ box.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 12.56.02.png"/>


## Manage your contact details (destinations) in Argus
Add, edit or delete contact details, aka destinations, in your settings. Destinations that are present in your settings can be used when [customizing alarm notifications](#customize-alarm-notifications-in-argus).

<img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.33.57.png"/>

In Argus, _emails_ and _phone numbers_ are the destinations that are configured by default.
If you wish to receive notifications to other media, read about configurable media types [here](https://argus-server.readthedocs.io/en/latest/notifications.html#other-notification-plugins).

### Access your destinations in settings
1. Click on the _user icon_ in the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 13.53.49.png"/>
   
2. Click on `Destinations` in the drop-down menu.

    <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.28.29.png"/>
    
### Add new destination in settings
1. [Go to your contact details](#access-your-destinations-in-settings).
2. Click on the *Plus* button in the _Destinations_ header to open the _Create new destination_ menu.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.36.27.png"/>
   
3. Select destination's media type.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.37.20.png"/>

4. Type in a title (optional), and a destination value (required). Press `CREATE`.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.38.53.png"/>



### Edit existing destination in settings
1. [Go to your contact details](#access-your-destinations-in-settings).
2. Modify one of the existing destinations.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.42.40.png"/>
   
3. Press `SAVE`.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.42.40 copy.png"/>

### Delete destination in settings
1. [Go to your contact details](#access-your-destinations-in-settings).
2. Press `DELETE` inside one of your saved destinations.

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.43.41.png"/>

Note that some destinations are connected to your Argus user profile, and can not be deleted. The `DELETE` button is disabled for such destinations:

   <img src="public/screenshots/manual/Screenshot 2023-04-25 at 18.45.53.png"/>



## Log out from Argus
1. Click on the _user icon_ in the header.

   <img src="public/screenshots/manual/Screenshot 2022-09-08 at 13.53.49.png"/>
   
2. Click on `Logout` in the drop-down menu.

   <img src="public/screenshots/manual/Screenshot 2022-09-07 at 14.18.11 2.png"/>



