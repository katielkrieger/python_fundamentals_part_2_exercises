# use the requests module at the OMDB API

# Build an app that prompts the user for 
# two pieces of information: the name of an 
# actor/actress and a movie. 

# Your program should tell the user if that 
# actor or actress was in that movie (this 
# will only work for leading actors and actresses). 

# As a bonus, add functionality to tell users who 
# the director and writer of a movie were.

import requests
import json

star = input("Choose an actor or actress")
title = input("Choose a movie")

url = "http://omdbapi.com?t={}".format(title)

r = requests.get(url)

d = r.json()

director = d["Director"]
writer = d["Writer"]

if star in d["Actors"]:
	print("{} was in {}! It was directed by {} and written by {}.".format(star,title,director,writer))
else:
	print("{} was NOT in {} :(".format(star,title))