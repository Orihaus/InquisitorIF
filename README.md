# InquisitorIF
An engine for browser and multiplatform Interactive Fiction works.

Inquisitor is an Interactive Fiction engine built for use in both a browser-based and standalone form, built around putting spaces at the core of a hypertext work. A combination of Twine and Aliceffekt's Paradise if you will, designed to expand on the strengths of both as well as provide a pleasant reading experience.

Features:

Locations are defined by their name, and their place in the structure of the world is informed by this. For example the code:

~Rome - Viminal Hill - Piazza della Repubblica 
Flanked by grand 19th-century neoclassical colonnades, this landmark piazza was laid out as part of Rome’s post-unification makeover. It follows the lines of the semicircular exedra (benched portico) of Diocletian’s baths complex and was originally known as Piazza Esedra. (Lonely Planet)
Has created an entire city for you to populate, with districts that join together at the first location that defined them. Adding the additional code:

~Rome - Capitoline Hill - Piazza del Campidoglio 
This hilltop piazza, designed by Michelangelo in 1538, is one of Rome's most beautiful squares. You can reach it from the Roman Forum, but the most dramatic approach is via the graceful Cordonata staircase up from Piazza d'Ara Coeli. (Lonely Planet)
Has created another district with its own hub, that (by default) will automatically link to the Piazza della Repubblica as an adjacent hub location. If you're working with more specific links between locations, it's possible to disable automatic links between adjacent locations and hand define each link. Links use this format:

{Piazza della Repubblica: Take the bus to the Piazza della Repubblica}
Links are always two way, but it is possible to add conditions on entry.

{Piazza della Repubblica: Take the bus to the Piazza della Repubblica?HasBusTicket}
Will now prevent use of that link without the token 'HasBusTicket'. To give tokens it's as simple as adding +HasBusTicket to any action. Actions can be links, or they can be part of the description. Like thus:

|There is a bus ticket stuck on a bench. Take?:-You have taken the bus ticket.+HasBusTicket|
You can write this scripting in any text editor you like, just save the result as a plaintext .inq and change the first line of jquery.main.js to point to it. "var worldLocation = 'yourproject.inq';". This will be improved in future!

-

Inquisitor will automatically process and display background images for a location and all its children if you add '>yourimage.jpg' on a new line after your location definition.

-

Everything a player does is automatically saved to disk on move including location, settings and all the tokens they have acquired. This can be reset at any time by holding C.
