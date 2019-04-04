# InquisitorIF
An engine for browser and multiplatform Interactive Fiction works.

Inquisitor is an Interactive Fiction engine built for use in both a browser-based and standalone form, built around putting spaces at the core of a hypertext work. A combination of Twine and Aliceffekt's Paradise if you will, designed to expand on the strengths of both as well as provide a pleasant reading experience.

So what makes Inquisitor unique? When I started writing To Burn in Memory I was using Twine, but found the choice system to be more suited towards linear narratives than traditional phraser style worlds with locations and items. Inquisitor is a phraser-less hybrid of these styles, usable in both a browser format and as a standalone app, using Node.js or Electron.

# Features:

- Cardinal navigation.

- A fully dynamic ambient soundtrack system that evolves based user choices.

- A modern user interface.

- Support for graphical elements, including item icons and backgrounds.

- Scripting can be written in any text editor, with simple syntax and support for complex choice systems and even procedural locations, descriptions and logic.

# Scripting:

You can write Inqusitor scripting in any text editor you like, just save the result as a plain-text *.inq* and change the first line of "bootstrap.inq" to point to it. If you want to run Inquisitor locally, you'll need to disable restrictions on local file access in your browser. In Chrome this can be done by specifiying '--allow-file-access-from-files' as a startup parameter. Alternatively, you could use Node.js as your platform by simply dragging the Inquisitor folder onto your Node.js executable.

Everything a player does is automatically saved to disk on move including location, settings and all the tokens they have acquired. This can be reset at any time by holding *C*.

Locations are defined by their name, and their place in the structure of the world is informed by this. For example the code:

```
~Rome - Viminal Hill - Piazza della Repubblica 
Flanked by grand 19th-century neoclassical colonnades, this landmark piazza was laid out as part of Rome’s post-unification makeover. It follows the lines of the semicircular exedra (benched portico) of Diocletian’s baths complex and was originally known as Piazza Esedra. (Lonely Planet)
Has created an entire city for you to populate, with districts that join together at the first location that defined them. Adding the additional code:

~Rome - Capitoline Hill - Piazza del Campidoglio 
This hilltop piazza, designed by Michelangelo in 1538, is one of Rome's most beautiful squares. You can reach it from the Roman Forum, but the most dramatic approach is via the graceful Cordonata staircase up from Piazza d'Ara Coeli. (Lonely Planet)

```

Has created another district with its own hub, that (by default) will automatically link to the Piazza della Repubblica as an adjacent hub location. If you're working with more specific links between locations, it's possible to disable automatic links between adjacent locations and hand define each link. Links use this format:

```
{Piazza della Repubblica: Take the bus to the Piazza della Repubblica}
```

This link will return the player to the location we defined earlier. If there is a conflict where two or more locations share the same name, the link will take you to the nearest, otherwise the full name of the location can be used.

```
{Piazza della Repubblica: Take the bus to the Piazza della Repubblica?HasBusTicket}
```

Will now prevent use of that link without the token 'HasBusTicket'. To give tokens it's as simple as adding +HasBusTicket to any action. Actions can be links, or they can be part of the description. Like thus:

```
|There is a bus ticket stuck on a bench. Take?:-You have taken the bus ticket.+HasBusTicket|
```

Inquisitor will automatically process and display background images for a location and all its children if you add '>yourimage.jpg' on a new line after your location definition.

# Tutorial

The default 'world' included consists of a tutorial that showcases and explains core features you can use in writing your own works.

