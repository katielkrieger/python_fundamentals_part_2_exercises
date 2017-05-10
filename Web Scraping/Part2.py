# https://en.wikipedia.org/wiki/United_States_presidential_election

# This Wikipedia page has a table with data on all US
# presidential elections. Goal is to scrape this data
# into a CSV file.

# Columns:
#	order
#	year
#	winner
#	winner electoral votes
#	runner-up
#	runner-up electoral votes

# Use commas as delimiter.

# Ex: 1st, 1788-1789, George Washington, 69, John Adams, 34

# Hint: Use the pdb debugger

import bs4
import urllib.request
import csv
import os

url = "https://en.wikipedia.org/wiki/United_States_presidential_election"
data = urllib.request.urlopen(url).read()
soup = bs4.BeautifulSoup(data, "html.parser")

years = [str(year) for year in range(1788,2016,4)] # list of years as strings

os.remove("elections.csv")
with open("elections.csv", "a") as csvfile:
	data_writer = csv.writer(csvfile, delimiter=",")
	data_writer.writerow(["Order","Year","Winner","Winner Electoral Votes","Runner-up","Runner-up Electoral Votes"])
	data_writer = csv.writer(csvfile, delimiter=",")

	# for year in years:
	year = years[0]

	tables = soup.findAll('table.wikitable')
	for table in tables:
		anchor = table.find('a', text="1796")
		print(anchor)
	# anchors = [soup.find('a', text=year) for year in years]

	year_DOM = anchor.parent.parent
	# print(year)

	#winner = anchor.findNext('td').findNext('td') # George Washington
	winner = anchor.parent
	# winner_name = winner.text # George Washington

	# winner_elec_votes = winner.findNext('td').findNext('td').findNext('td').findNext('td').text.split("/")
	# winner_elec_votes = winner.parent.find("span.nowrap")
	print(year,winner.text)
	# winner_elec_votes = float(winner_elec_votes[0])
	# print(winner_elec_votes) # 69

	# print(runner_up_elec_votes) #138

	# runner-up

	runner_up = year_DOM.findNext('tr').find('td').findNext('td')
	if "[" in runner_up.text:
		runner_up_name = runner_up.text.split("[")[0]
	else:
		runner_up_name = runner_up.text
	# print(runner_up.text.split("[")[0]) # John Adams

	runner_up_elec_votes = runner_up.findNext('td').findNext('td').findNext('td').findNext('td').text.split("/")
	# runner_up_elec_votes = float(runner_up_elec_votes[0])

	# print to CSV
	
	# data_writer.writerow([1,year,winner.text,winner_elec_votes,runner_up_name,runner_up_elec_votes])




# print(anchors)

# first_rows = [soup.find(anchor.parent) for anchor in anchors]

# winners = [soup.find(first_rows).findNext('td').findNext('td')]
# print(winners)
