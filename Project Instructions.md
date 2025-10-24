@everyone
# Course Project

Use this (depending of what group you are in):
**.NET**: C# (required), Blazor or MVC (you choose); of course, you use JavaScript or TypeScript as needed
or
**JavaScript**: JavaScript or TypeScript (you choose), React, Express (you can choose other framework instead Express if you want)

Use CSS framework (Bootstrap is recommended, but you can use _any_).

```You can use any database and any other libraries, components or even frameworks (but not replace specified above).```
There are no limitations in the area of architecture or used services. For example, you are not required to have a separate full-featured application server separated from Web server, or have a lot of things on the client, or use microservices, etc.; you may approach this whatever way you want. 

It's recommended to use _the simplest and the safest_ approach to the persistence, namely relational databse, e.g. PostgreSQL, MySQL, SQL Server, anything, but again you don't have to, you may try to use MongoDB or something (for this task it's definitely not the best idea, meh...). Again, you may replace Bootstrap with any CSS framework and/or UI library you like. 

React is required for JavaScript group; it can be used by .NET group as well.

You have to implement *a Web application for inventory management* (office equipment, books in library, documents in HR department, etc.). Users define arbitrary "*inventories*" (the set of fields with a title and description, etc.), and other users fill inventories with "*items*"  (specific ) using these templates (e.g., enter or select values in the fields). Two the most important features are custom inventory numbers (IDs) and custom fields.

E.g., I create an inventory with a string-valued field "Model" and a number-valued field "Price". Other users add their laptops to this inventory.

If your app will have N buttons (view/edit/delete in _each_ item), your result will be graded -20%. Use toolbars, or animated "appearing" context actions, etc.

This is forbidden:
```
┌─────────┬─────────────────┬ ┬────────────────┐   
│ ID      │ Equipment       │…│                │   
├─────────┼─────────────────┼ ┼────────────────┤   
│ XD_6332 │ Personal laptop │…│ [Edit][Delete] │
├─────────┼─────────────────┼ ┼────────────────┤   
│ XN_23FA │ Fax machine     │…│ [Edit][Delete] │ 
├─────────┼─────────────────┼ ┼────────────────┤   
                        …                     
├─────────┼─────────────────┼ ┼────────────────┤ 
│ YN_544C │ Workstation     │…│ [Edit][Delete] │   
└─────────┴─────────────────┴ ┴────────────────┘ 
```
This is OK:
```
[Delete]
   
 ⍰  𝐈𝐃        𝐄𝐪𝐮𝐢𝐩𝐦𝐞𝐧𝐭             𝐘𝐞𝐚𝐫               
─────────────────────────────────────────────  
 ☐  XD_6332   Personal laptop      2025
 
 ☑  XN_23FA   Fax machine          2023
 
 ☐  YN_544C   W͟o͟r͟k͟s͟t͟a͟t͟i͟o͟n͟          2027 
                    ☝ 
```
> You have to use table representation for items and inventories, no ~~gallery~~ or ~~tiles~~.

Every page provides access to full-text search via the top header. 

Inventories, as well as items, should be displayed in table views by default. You may add other display options, but do not replace the tables.

Non-authenticated users cannot create inventories, leave comments or likes, or add items. However, they can use the search function and view all inventories and items in read-only mode.

The admin page allows user management, including: viewing, blocking, unblocking, deleting users, adding users to the admin role, and removing them from it.

> Important: AN ADMIN CAN REMOVE ADMIN ACCESS FROM THEMSELVES.

Admins have full access and can view all pages as if they were the creator. For example, an admin can open another user's inventory and add fields or edit items—effectively acting as the owner of every inventory.

Only the creators (and admins) can edit their inventories (e.g., add/edit/delete fields, manage access, etc.). Creators define which users have write access (add/edit/delete) to their inventory. Creators can also mark an inventory as public, granting write access to all authenticated users.

Items in an inventory can be modified by the creator (and admins), and any users with write access (or by all authenticated users if the inventory is public).

All items are viewable by everyone, regardless of authentication status.

Users can register and authenticate via social netowrk (at least two; Google and Facebook are  very good options).

Every user has their own personal page, where they can manage two sortable/filterable tables:
* A table of inventories they own (with options to create new, delete, or edit).
* A table of inventories they have write access to.

Each inventory in the table functions as a link to its dedicated page, which contains several tabs:
* Table of items in the inventory (with links to individual item pages).
* Discusison section.
* General settings — title, description, etc.
* ***Custom inventory numbers.***
* Access settings — either all authenticated users (for public inventories) or specific users (for non-public ones).
* ***Editable set of fields for all items in the inventory.***
* Inventory statistics/aggregation, such as the number of items, averages and ranges for numeric fields, most frequently used values for string fields, etc. The owner doesn't edit anything on this tab.

For users with write access (but not ownership), only the 1st and 2nd tabs are accessible in edit mode (items).

The inventory author and users with write access can:
* Click any item to open it in edit mode.
*  Delete existing items.
* Add new items.

Users without write access can only view items; they cannot add, edit, or delete them.

> Access is managed by maintaining a list of users, with the ability to remove users from the list and add new ones by typing a username or email address (autocomplete is required both by name and e-mail). The list is sortable, with a user-switchable sort mode (by name or by email).

> Inventory page supports **auto-save** capability (it's not required for items). Don't try to save every user keystroke; instead, track changes and save every 7–10 seconds. Beware of optimistic locking—each save operation either updates a version in the database and returns it for the next save, or fails.

Inventory settings include the following:
* Title.
* Description (supports Markdown formatting).
* Category — a single value selected from a predefined list, e.g., Equipment, Furniture, Book, or Other (Note: new values are added directly in the database; no UI is required for this).
* Optional image/illustration — uploaded by the user to the cloud.
* Tags — users can enter multiple tags. Autocomplettion for tags is required: when the user starts typing, a dropdown should appear with existing tags from the database that start with the entered text.

Each inventory can be marked as public (allowing any authenticated user to add items), or the creator can manually select a list of registered users who are granted access.

The __first "killer-feature" is that an inventory allows the specification of custom fields for its items__.

In addition to the globally unique internal ID (not displayed in the UI), each inventory can define its own custom ID format, which generates a unique ID specific to that inventory. This format is customizable.
* Custom IDs are unique within the scope of a single inventory. Items in different inventories may have the same custom ID.
Uniqueness is enforced at the database level—it's not possible to insert or update an item with a duplicate ID within the same inventory.
* The custom ID is not the primary key (unique for the whole table and permanent) in the `[items]` table, but is instead managed by a separate composite database index (`inventory_id` plus `custom_id`).
* Custom IDs are editable. On the item form, the ID is edited as a single string using one input field, with format validation applied.

When an item is created, the custom ID is generated by the system and saved to the database. If the custom ID format is later changed for the inventory, existing item IDs remain unchanged; however, during item editing, the new ID format rules are enforced.

The Custom ID tab includes a real-time example preview of the resulting ID.

The following ID parts (elements) are supported:
* Fixed text (with full Unicode support),
* 20-bit random number,
* 32-bit random number,
* 6-digit random number,
* 9-digit random number,
* GUID,
* Date/time (at the moment of item creation),
* Sequence (value equal to the largest existing sequence number +1 at the moment of item creation).

Users can:
* Reorder ID elements via drag-and-drop.
* Remove elements by dragging them outside the form.
* Add new elements, with a recommended upper limit of at least 10 elements.
* Change element formatting rules, e.g., format numbers with leading zeros.

The form should include detailed help, using popovers, to guide users through formatting options.

Please note that _illustration below is not a complete page_. You also need site navigation, account-related features—such as login/logout, language selection, and theme switching and more,—search functionality, etc.

Of course, conflicts can occur during item submission when an item is created or edited (e.g., multiple users add items in parallel, a randomly generated value is duplicated, etc.). In such cases, the database should reject the items, and the user will need to manually edit the custom ID value.

The __second "killer-feature" is that an inventory allows the specification of custom fields for its items__.

There are also fixed fields that are always present. These fields are not visible in the UI for field customization but are displayed on every item form. For example, automatically generated fields like `created_by`, `created_at`, or `custom_id`—the latter being editable despite its automatic generation.

In addition to the fixed fields, it's possible to add custom fields, with the following limitations:
* Up to 3 single-line text fields.
* Up to 3 multi-line text fields.
* Up to 3 numeric fields.
* Up to 3 document/image fields (entered as a link).
* Up to 3 true/false fields (displayed as checkboxes).

Each custom field includes:
* Title.
* Description (displayed as a tooltip or hint in forms).
* A boolean flag indicating whether the field should be displayed in the item table view (on the inventory's tab).

> Fields can be reordered via drag-and-drop.

For example, suppose I want to create an inventory for books in a library. I might add the following fields:
* Single-line field: "Title"
* Single-line field: "Authors"
* Numeric field: "Year"
* Multi-line field: "Annotation"

The main page of the app contains:
* A table of the latest inventories, showing the name, description (or image), and creator.
* A table of the top 5 most popular inventories, based on the number of items.
* A tag cloud — when a user clicks a tag, a list of related inventories is displayed (you should reuse the standard “search results” page layout for that)

Each inventory page includes a discussion tab. Posts are linear—new posts are always added to the end; inserting posts between existing ones is not allowed. Posts should be updated automatically—when someone adds a post, it should appear for all users viewing the page within 2–5 seconds (real-time or near real-time updates). Every post displays Markdown text, user name (which works as a link to the user's personal page), and a date/time.

Each item has a "like" feature (a user can give one like per item, and no more than one like from the same user is allowed).

> You need to implement _optimistic_ locking for inventories (which can be modified simultaneously by the creator and admins) and for items (which are modifiable by multiple users with write access at the same time).

The application should support two UI languages: English and one additional language (e.g., Polish, Spanish, Uzbek, Georgian, etc.). The user selects the language, and their choice is saved. _Only the UI is translated_ — user-generated content such as inventories or items is not translated.

The application should also support two visual themes: light and dark. The user selects the theme, and their choice is saved.

***Requirements***:
* Use a CSS framework (e.g., Bootstrap — or any other framework and set of UI controls you prefer).
* Support responsive design for various screen sizes and resolutions, including mobile phones.
* Use an ORM (e.g., Sequelize, Prisma, TypeORM, Entity Framework — any is acceptable).
* Use a full-text search engine, either through an external library or native database features.

***DON'T***s:
* Don’t perform full database scans using raw SELECT * queries.
* Don’t upload images to your web server or database.
* Don’t execute database queries inside loops.
* Don't add buttons in the table rows.

> Is it possible to use the X library? ***Yes***, yes to all — remember my choice.

**Optional Requirements**
(for a separate grade—only if all core requirements are fully implemented)
* Display document previews for document/image links in items (e.g., JPG and PDF).
* Implement form authentication with email confirmation as an alternative to social network authentication.
* Add additional “tuning” options to the fields, such as: length limits and regex validators for string fields, value ranges for numeric fields, etc.
* Add a field type “one from the given list”, with the ability to define the list of options (for example, the inventory creator defines a "Type" field with options like "Desktop" / "Laptop" / "Table".
* Allow an arbitrary number of fields of any type (not limited to 0, 1, 2, or 3—no upper limit).
* Inventory export to CSV/Excel.

**IMPORTANT NOTE**
Do NOT copy code from code dumps or old repositories, reqs are changing in small details. Anyway, it's much better to do less, but fully understand what you write. I'm dead serious; we will ask you to modify your code on the fly, add or change functionality, as well as ask technical questions. We want not only to check your ability to navigate and work with your own code, but to undestand _why_ every line is written. This is more important than the number of features you implement.

Your supervisor has seen many similar projects and is likely familiar with most publicly available examples online. Do not copy. ***Use libraries as much as possible***—but don't copy-paste code.

> Use ready-made components, libraries, and controls.

For example,  use a component to render Markdown, use an image uploader with drag-and-drop support, use a tag input control, use a tag cloud renderer, etc.

> The less custom code your app contains, the better.

And the most important: ***start by deploying a static "Hello, world" page and always keep a deployable version ready!***

And even more important than that: __**defend your project—even if you’ve only completed a small part of it**__.

@everyone

**Q: **"I did very few tasks, is it OK?", etc. 

**A: **From the very beginning I mentioned that it's OK if you don't finish some of the tasks. It’s possible to implement less than 100% tasks and less that 100% of project requirements. 

Some did more tasks, but some did few task better. Some will do project better. It’s not just a “number of tasks”. As Marcus Aurelius said, “Do less, but better.”

Also, here is another good point of view. Do not worry, but try your best. As one Frenchman said, “Do what you ought, come what may.”

@everyone

Please don't even think about using JSON to serialise items for _storage_ (you can pass items in JSON from the client to the server, of course). It's a bad idea. You will need to _edit_ inventories, and fields should be somehow preserved. E.g., it's possible to change the field title. Or remove the field. Of course, you shouldn't try to edit or "fix" items on the fly.

Think about this problem in this way: all the items for a given inventory should be "compatible," and you need to calculate aggregate values for them.

Also, don't even think about generating tables in the database on the fly. It's bad idea for several reasons. 

You need up to 3 fields of each type only. It means that you can consider the fields fixed and only manage whether they are shown and what titles are rendered. The relational database fits this task _perfectly_. It will work fast, and you won't get into trouble with "I don't know how to aggregate data from documents with different fields."

I got an exellent question. It was stated close to "How can I motivate myself to put really good efforts to work on the project?”. And I remembered a thing that students from previous group have found interesting.

From the motivation point of view — I don't know, it's the question that only _you_ can answer.

Decide for yourself do you really wanna be an software engineer? Are you excited when you make something work? Does a light bulb go on in your head when you comprehend that bitwise OR can be considered as bitwise MAX (and AND is MIN)? Do you like to optimise something, finding the way to make the same thing 10 times smaller or 1000 times faster? Or exploring a clever new API that allows you to do in one line what would take several screens of code yesterday? Do you feel joy when several machines running all around the globe solve your problem? 

Or it’s just some boring typing and clicking?

You are relatively young, try to find your passion. I really believe that if programming is boring to you right now, it will be even harder later. And even in IT there are areas where you don't need to be an engineer per se.

The best possible result is a working application. But even if it's not ideally polished nad 100% complete, in this case it's better to fight to the end. 

And here is an idea about dropping out and quitting:

> The main danger of dropping something in the middle is that it creates a bad habit. It's very much like "it's only one cigarette; it doesn't really matter," you know. "It's only a learning project." Well, it's technically true in every single moment of your life. It's only one smoke at a time. Or only one dropped project at a time. But it usually becomes a habit.

There are many similar questions about future, like "What can I do if you won't make a job offer for me?".

**First of all, hope to win and aim to victory.** Second, every line of code and every solved task is an investment in your own future. 

Of course, we hope to make offers to as many talented students as possible.

But even if you will not get a job offer from us immediately (we’ll try), we hope that we’ll be able to help you somehow (note, that this only will work for those of you who will bring your project to us, even if it’s not complete finished):

1. We will provide you with a list of additional tasks for self-education (and it wouldn’t be the easiest tasks).
2. We will obviously store you results to make an offer later and put you in “the waiting list”.
3. We will try to advise you if you will have some technical tasks for the next month (of course, we will not solve them for you, but if you will get some coding tasks, you could ask for advices — what to read, what approach to choose, etc.)

Again, to get an access to this proposal, you need to get a certificate of completion for our program (you will get it after the project defence conditional on any result > 25%). I hope this will help you to motivate yourself to work next month.

Please, don't forget that you'll get an additional reqs later (like in real life). You'll be asked to implement up to 3 integrations of your project with the 3rd-party applications/services. So, DON'T IMPLEMENT some kind of "store" or "blog" — the requirements are pretty specific about the functionality and you need to implement an app for the arbitrary inventory management. Not specifically "library" app of "storehouse" app, but arbitrary "inventory".

Here are some explaining about optimistic locking used everywhere. It's a good topic for discussion during the interview – how to implement correct workflow for multiple users. But I post it here, because you will need it in your course projects.

You need to understand how it works to be able to implement _the correct behavior for end users_.

**What is optimistic locking?**

A long time ago, when computers were big, the "standard" approach was the following:
```
[Client 1]-read/write
                     \
[Client 2]-read/write->[Database]
                     /
[Client 3]-read/write
```
Clients were written in C++ or Delphi, were "fat," were able to render complex UI, etc.

Let's assume that our application allows managing a dog shelter and contains the following "[dogs]" table:
```
+----+---------+------------|--------+------------+-----------+-------+
| id |  name   |  accepted  | gender | vaccinated |   breed   | owner |
+----+---------+------------+--------+------------+-----------+-------+
|  1 | Hodge   | 1094058900 | F      |          0 | dachshund |  NULL |
|  2 | Hodge 2 | 1171950300 | M      |          0 | dachshund |  NULL |
|  3 | Stitch  | 1024228800 | M      |          1 | collie    |    17 |
+----+---------+------------|--------+------------+-----------+-------+
```
Of course, when multiple clients work with the same data, conflicts may arise. For example, "Client 1" loads a record with `id=1` and looks up the owner. From the other machine, "Client 2" opens the same record, checks the "Vaccinated" checkbox, and saves the form with the new value for the `[vaccinated]` field. When "Client 1" finishes drinking its coffee and saves the form with the set owner, he or she rewrites the `[vaccinated]` field back to `0`.

Not good.

You may think about updating only _changed_ fields, but it doesn't really help—sometimes users edit the same fields, e.g., incrementing a numeric value, I don't know, `[incidents]` or something. Also, it would compicate implementation quite a lot.

Of course, _transactions_ doesn't help here much because the time between opening the form for editing and saving data is too long. Theoretically, we may think about transaction at least in the old two-tier architectures, but practically it was close to impossible even there. Loading data to show in the form and saving data after the updat are two separate queries, separated by arbitrarily long periods of time.

So, we need to "lock" records somehow. So, we add two fields into the table, `[locked_by]` and `[locked_at]`. If "Client 1" opens the record for editing, we check the `[locked_by]` and if there is the `NULL` value, we save the client id into `[locked_by]` and the current timestamp into `[locked_at]`. When the other clients try to open the same records, they won't be able to do so because the field `[locked_by]` is not `NULL` (and clients should get a corresponding message in the UI). Of course, when "Client 1" saves the data, the `[locked_by]` field is reset back to the `NULL` value.

Well, it's called "pessimistic locking," and it worked pretty well many years ago. However, there are problems with this approach:
1. It requires the database modification exactly two times, even if the user clicks the "Cancel" button (and database writes are much more difficult to scale than database reads).
2. It makes nice modern in-place in-table editing impossible from the practical point of view—we need to lock the whole table.
3. We need to implement "forced unlocking" functionality, both by timeout and by admin or power users (e.g., a user who locked the record is unavailable, went for a coffee, is sick, or is dead).
4. So, it means that we still have to process the "locked record was unlocked by someone else" case, implement corresponding messages, etc.

Just as a note, the problem isn't only in update operations; delete operations are also problematic—when you analyze a record and decide to delete it, you don't want to delete changed values you didn't see, right? RIGHT?

Today, applications are often "architected" in a different way.
```
[Client 1]->[Server 1]---read--->[Read-only DB replica]
                      \                    ^
[Client 2]             --write---     replication
          \                      \         |
           >[Server 2]-read/write->[Primary database]
          /
[Client 3]
```
Now we can forget about even the possibility of transactions across multiple tiers (of course, the transactions ***must*** be used on the server to perform "complex" tasks consisting of multiple queries, like transfering values from one entity to another).

Fortunately, in modern applications, the following conditions are usually true:
1) Reads occurs much more often than writes (people read reviews more frequently than write them). Some streams of writes, like logging, can be "redirected" to separate storage, optimized for fast inserts.
2) The same records are edited by the different users very rarely (it's possible, and should be _processed properly_, but such cases are rare). We may assume that records are unlikely to change before the update or delete operation.

It means that we can use so-called optimistic locking. When we read a record to show on the UI, we do nothing—you like it already, right? But when we update or delete that record, we check whether the record was changed in the time passed since the read operation.

How?

There are several strategies.

1. We can replace the typical `WHERE id=1` clause in the `UPDATE` and `DELETE` queries with the condition for all the editable fields, e.g., `WHERE id=1 AND accepted=1094058900 AND gender='F' AND vaccinated=0 AND breed='dachshund' AND owner IS NULL`. Remember, you don't concatenate SQL queries manually—it's a [road straight to hell](https://en.wikipedia.org/wiki/SQL_injection)). This approach is bulky; we need to send a copy of the original data back through all the layers, but the advantage is that we don't modify the database scheme at all.
1. We add an additional `version` field and update it in every `UPDATE`. The `WHERE` clause becomes `WHERE id=1 AND version=42`. It's pretty simple. What type can be used for the version field? There are a lot of options with pluses and minuses:
  * A numerical field that is incremented in every `UPDATE`; it's easy to debug the history of changes, but you need to modify the `SET` part of the `UPDATE`.
  * A timestamp field that is automatically updated when a record is changed; it works pretty "automagically."
  * A GUID field that is re-generated for every update; it's more difficult to debug and it's slower, but it allows easy data merging from multiple cluster nodes.

Well, this is called optimistic locking. Of course, you need some client code that will process situations when an update or delete operation fails to find any record to modify (reload data and show a message with the proposition to try again; in real applications, you may be forced to preserve data entered by the user and implement some merging interface).

Of course, it's a pretty standard mechanism, and ORM usually takes care of the _most_ of it (but it cannot show proper messages to the user).

Please note that everything written above should not be used as an instruction "do it all"; you don't need multiple databases, any kind of replication in your tiny projects, merging, etc. But you'll need _optimistic locking_.

Note, that the optimistic locking is not a task for mythical "exclusively front-end" developers or mythical "exclusively back-end" developers. Unfortunately (or fortunately, depending whether you hate your job or love it) it's one of the cross-cutting tasks that should be implemented across "layers". You cannot have some API that "hides" locking from "front" or "back", because:
1. you need to pass some kind of versions (see above) to API,
1. you need to show proper messages, resolve conflicts or provide reload/retry functionality for the end-user, etc.
Also, you don't "encapsulate" optimistic locking on the "higher" layers, because you need to "synchronise" different versions somehow.

@everyone

***Don't overcomplicate.*** **Don't invent two linked databases SQL + NoSQL, don't change database scheme on-the-fly, etc.**

For basic requirements without optional ones (remember, you need to make it work first, and only after that you may add  some fancy stuff) use the simplest possible approach. Each inventroy has the following attributes (and possibly other for access, custom ids, ):
```
id
title
description
image_url
creator_id
category_id
is_public
custom_string1_state
custom_string1_name
custom_string2_state
custom_string2_name
custom_string3_state
custom_string3_name
custom_int1_state
custom_int1_name
custom_int2_state
custom_int2_name
custom_int3_state
custom_int3_name
custom_bool1_state
custom_bool1_name
custom_bool2_state
custom_bool2_name
custom_bool3_state
custom_bool3_name
... etc. ...
```
So, if user defines a single string question "Enter your name" in the template, you set `[custom_string1_state]` to `TRUE` and
`[custom_string1_name]` to `"Laptop price"`.

Or you can use `NULL` value in the `*_name` fields to designate undefined fields. But you get the idea, I hope. The variant above is more flexible, e.g. `*_state` fields can store more then two variants, e.g. NOT_PRESENT,  PRESENT_OPTIONAL, PRESENT_REQUIRED, etc., in the simplest implementation these are booleans, the field is whether shown or hidden).

@everyone

Okay, here are few examples. 

The head of an office services department in a company wants to track all the computer equipment. She creates a registry called “Company Owned Computers,” defines a format for custom inventory numbers as `COMP-2025-E74FA329-001`, consisting of the year when the computer was registered, a random 32-bit value, and a sequence number. She also defines custom fields: Model (a string) and Price (a number). After that, IT personnel can enter the information about all the computers used in the company.

An HR employee creates an inventory for books (a registry for some kind of company library), defines no custom IDs, and sets up two string fields — Book Title and Book Authors — as well as a multiline text field Annotation. Then he enters the information about the books to track them.

An owner of a small store that sells radio components wants to track all the goods in her store. She creates an inventory called “Parts”, defines a simple format for IDs consisting of the string “PART” followed by a zero-padded sequence number (like `PART-0000001`), and defines several fields such as Voltage (a number), Current (a number), Model (a string), and Datasheet Link (a link). Then she and her assistant register all the parts in the store.

@everyone

An alternative form of the project requirements (abridged) for your convenience: https://coggle.it/diagram/aIkaxEAoK6_2Mb7_/t/project/dede5583c00c27a55953323d6cc305b9c675144191befe39bd2b98da6ade19d7

@everyone

Yes, data integrity is paramount. Unless there are very rare and very specific requirements, you shouldn't risk compromising it. 

So, what's about deletion? Sometimes it's acceptable to mark something as "deleted" instead of actually deleting it. But other times, that's not appropriate.

The implementation of deletion really depends on the requirements, because there may be constraints — even legal ones — about whether data should be fully deleted at a user's request (e.g., for personal data protection) or, conversely, retained for a certain period (e.g., for tax or healthcare records).

In our case, since there are no explicit requirements, you can choose the option that's easiest for you to implement. Depending on your approach, this could mean either cascade deletion or simply marking the data as deleted. 

Usually, cascade deletion in the database is the simplest—you can rely on the DB to maintain referential integrity and write `0` lines of additional code.

Of course, you shouldn't reinvent the wheel here. Just set up cascade deletion in the database. Unfortunately, many students decide to write a lot of unnecessary code like “delete inventory, delete related comments, delete related items in a loop,” etc. This approach won't work.

First of all, it's too slow — but that's not the main problem. Imagine you've deleted the inventory and started deleting the linked entities, and then a network hiccup occurs. Oops.

Sure, you can make it work if you use transactions properly (which you'll need in other situation in the project), but it will be inefficient (locking the access to multiple "main" tables at the same time) and why write code for something that the database can handle for you automagically?

But yes, it's possible to mark deleted data as deleted and add additional code to handle it through layers, nut you may choose the simplest approach.

Just to help to understand. Item field _names_ are defined in the inventory (as well as whether this field is displayed in the items of that inventories). Field _values_ are stored *in the items*.

User choose any set of fields, they doesn't depend on the category, which is just a field to filter inventories. E.g. user can create an inventory with topic "Furniture" and add a filed "Book Tiles"— don't try to "understand" and restrict this.

**Category** is just a field in the inventory. It doesn't do anything, it's used only for sotring and filtering in the tables of inventories. It’s a value from a lookup table in the database (so it can be extended without code modifications; but you don’t need to create UI for editing/adding/deleting the categories).

Any user can create an inventory, give it any name and select any category. Inventories don't have any links between each other. They are totally independend.

If you choose database, consider using PostgreSQL instead of MySQL, the former is more often free than MySQL — e.g., Render provides PostgreSQL (if you use ORM – and you should – the migration is a very easy task).

You don't implement UI for category management. It's up to database administator how to delete or add categories. 

You may think of using NULL value in the category as a specific marker that will be displayed as "Other" on UI (in proper language, of course). It seems reasonable.

@everyone

Let's say a user (AUTHOR) creates an inventory with two fields:
"Person Age" (numeric) and "Person name" (string).

Then another user (USER A) adds an item and provides values
21 and "Mary".

Then another user (USER B) adds an item and provides values
32 and "John".

Then AUTHOR edit the first numeric filed to "Finger count", and adds a new string question "Address". 

After that USER C adds an item and provides values 10, "Ellen" and "Frisco"

So, your database contains the following data in the answers (and other fields of course):
```
 INTEGER 1 | INTEGER 2 | INTEGER 2 | STRING 1 | STRING 2 | STRING 3 
-----------+-----------+-----------+----------+----------+----------
        21 | NULL      | NULL      | Mary     | NULL     | NULL     
-----------+-----------+-----------+----------+----------+----------
        32 | NULL      | NULL      | John     | NULL     | NULL     
-----------+-----------+-----------+----------+----------+----------
        10 | NULL      | NULL      | Ellen    | Fricso   | NULL    
```
When you show aggregation, you display that users have 21 fingers on average (toes aren't fingers, but _you_ don't control the field names and their meaning).

It's may seem strange, but it was the change made by an inventory author, you may just ignore this issue. Don't overcomplicate.

Why do you need to store images in the cloud? Wouldn't be easier to save images into the database in Base85 or Base64 or something? Actually, there are special BLOB types for this, so you don't even need "encoding".

1. Databases aren't optimized for the files. Any modern database has some kind of a BLOB type, but it doesn't mean it works really well. Usually, record or document should be small enough to work efficiently, however, file almost universally means "too big".
1. Files should be ideally processes as streams, not byte arrays. **You may ignore this for the project**, but if every of 1000 users load in memory 10 MB byte array, you would loose 10 GB only for files (remember that you have to push this data through all you servers to the DB). Again, modern databases like SQL Server has embedded capabilities for streaming, but this will require writing pretty low-level SQL queries, and there are nuances with transactions, etc. Again, it's better to use a specifically designed file storage for such task.
1. Typical files (likes images, audio or video data) are edited rarely, they are effectively read-only. If needed, they re-uploaded from scratch. So, you need a _static_ storage with multiple levels of caching. Again, we resort to cloud/CDN that can provides downloading to the client from a fast server located in a data-center close to any given user (and all the caches will work as best as possible, becuse it's the "cloud's business"). And at some point additional resources can be allocated to download data from a separate domain of the CDN. In general, clould file storage will work significantly faster that your database-based one (or your Web-server "upload near the scripts" one). And it will scale much much better.
1. Database resources (storage, memory, connections) are really expensive in reality. So, you'll pay much more for streaming your files from the database (again, you pay for all the servers en route; if use cloud-based file storage, you may pay for _uploading_ through your servers, however remember point #3). So, it's cheaper to give files away from a separate storage.
1. The fewer files you upload to your server, the better you may feel about security. 🙂

Of course, there is also a drawback — you don't get transactions, for example. However, if you implement everything accurately, you don't need them. Just order your cloud and DB operations in such way that you _may get "garbage" unneeded files **not** "broken links"_ in the database. For example, upload an image first and then add a link to database. And vice versa, delete a record from the database first and then delete an image file. In the worst case you'll need a trivial "garbage collector" that will periodically remove obsolete files _when the load is low_. It may be a simply cron job, **but you don't need this for the course project.** Yes, even if you are a "front-end developer", you need to think of such thing as garbage collection and consistence to use the proper order of calls. That's engineering for you.

There are a lot of services, starting from major league, Amazon and Azure, to quick and simple fre ones. E.g., Cloudinary – you may upload your first image via API and get a link to it in 5 minutes including login time with a Google account and installing necessary library (literally 5 minutes – I checked it for myself). It's dead simple – there are code examples for JavaScript, Python, PHP, Java, C# Ruby, Go, Dart.

You ***don't need to translate user data*** — internationalisation (i18n) concerns only UI elements (menus, links, buttons, labels, tooltips, etc.). User entries (inventory titles, item fields) are stored and displayed as entered.

You don't have to implement GUI for category management. So, users cannot create categories, but they can create tags. In case if app owners decide to add a new category, they can modify a corresponding table in the database. 

Tags are created during the first use, it's the standard behavior for tags.