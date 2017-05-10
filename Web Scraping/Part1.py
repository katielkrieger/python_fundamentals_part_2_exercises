# Use BeautifulSoup to go to https://news.google.com
# and print out all of the headlines on the page

import bs4
import urllib.request

url = "https://news.google.com"
data = urllib.request.urlopen(url).read()
soup = bs4.BeautifulSoup(data, "html.parser")

# span class="titletext" or span.titletext

headlines = soup.select("span.titletext")

titles = [headline.text for headline in headlines]
print(titles)

# Write a function called find_headline_by_keyword
# that lets you search those headlines for keywords
# and returns a list of all headlines that match
# all keywords provided

def find_headline_by_keyword(keyword):
	return [title for title in titles if keyword in title]

print(find_headline_by_keyword("Trump"))