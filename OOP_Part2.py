from random import shuffle
from functools import wraps
import csv
import os


# Bonus
def log(f):
	@wraps(f)
	def wrapper(*args, **keywords):
		# os.remove("deck.log")
		with open("deck.log", "a") as file:
			file.write("{}{}\n".format(f.__name__,args))
		return f(*args, **keywords)
	return wrapper


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

	@log
	def deal(self):
		if len(self.cards) == 0:
			raise ValueError("No cards left in deck")
		card = self.cards.pop()
		return card # returns the card dealt (last card in array)

	@log
	def shuffle(self):
		if len(self.cards) < 52:
			raise ValueError("Not a full deck. Can't be shuffled.")
		shuffle(self.cards)
		return self

	@log
	def save(self):
		os.remove("deck.csv")
		with open("deck.csv", "a") as csvfile:
			data_writer = csv.writer(csvfile, delimiter=",")
			for card in self.cards:
				data_writer.writerow([card.value, card.suit])

	@log
	def load_from_csv(self):
		with open("deck.csv") as csvfile:
			reader = csv.reader(csvfile)
			rows = list(reader) # makes an array of arrays
			self.cards = []
			for row in rows:
				self.cards.append(Card(row[1],row[0]))

class Card():
	def __init__(self,suit,value):
		self.suit = suit
		self.value = value

	def __repr__(self):
		return "{} of {}".format(self.value, self.suit)


# testing

# d = Deck()
# print(d.cards)
# print("---creating deck---")
# for card in d:
# 	print(card)
# print("---shuffling---")
# d.shuffle()
# for card in d:
# 	print(card) # new order
# print("---dealing---")
# dealt = d.deal()
# print(dealt)
# print('---saving---')
# d.save()
# print('---loading---')
# d.load_from_csv()
# for card in d:
# 	print(card)
