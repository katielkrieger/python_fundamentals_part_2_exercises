from random import shuffle
from functools import wraps
import csv
import os

# Bonus
def log(f):
	@wraps(f)
	def wrapper(*args):
		print("{}{}".format(f,args))
		return f(*args)
	return wrapper

@log
class Deck():
	def __init__(self):
		suits = ["Hearts","Clubs","Diamonds","Spades"]
		values = ["A","2","3","4","5","6","7","8","9","10","J","Q","K"]
		self.cards = [Card(suit, value) for suit in suits for value in values]

	def __repr__(self):
		return "{} cards left in the deck".format(len(self.cards))

	def __iter__(self):
		for card in self.cards:
			yield card

	def __next__(self):
		if self.card.index == 0:
			raise StopIteration("No cards left in deck")
		self.card.index -= self.card.index
		return self.cards[self.card.index]


	def deal():
		if len(self.cards) == 0:
			raise ValueError("No cards left in deck")
		return self.cards.pop()

	def shuffle():
		if len(self.cards) < 52:
			raise ValueError("Not a full deck. Can't be shuffled.")
		shuffle(self.cards)
		return self

@log
class Card():
	def __init__(self,suit,value):
		self.suit = suit
		self.value = value

	def __repr__(self):
		return "{} of {}".format(self.value, self.suit)

# BONUSES:

# log the function and arguments called - see def log above
# print(Deck())


# iterate through deck, printing the first card and
# logging all cards to a file deck.log - original way
# d = Deck()
# print d.cards[0]
# for card in d:
# 	with open("deck.log", "a") as file:
# 		file.write("{}\n".format(card))


# iterate through deck, logging it to a csv in order
d = Deck()
os.remove("deck.csv")

with open("deck.csv", "a") as csvfile:
	data_writer = csv.writer(csvfile, delimiter=",")
	for card in d:
		data_writer.writerow([card.value, card.suit])

# load deck from a csv
with open("deck.csv") as csvfile:
	reader = csv.reader(csvfile)
	rows = list(reader)
	d.cards = []
	for row in rows:
		d.cards.append(Card(row[1],row[0]))



print(d.cards)