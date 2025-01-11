from bs4 import BeautifulSoup

class LastUpdated:
    def __init__(self, page):
        self.page = page
        update_time = self.get_last_updated()
        self.write_to_html(update_time)

    def get_last_updated(self):
        self.page.goto("https://sauktiniai.karys.lt")
        self.page.wait_for_selector("h3.subtitle")
        last_updated = self.page.locator("h3.subtitle > span > span").element_handle().inner_text()
        print(last_updated)
        return last_updated

    def write_to_html(self, update_time):
        soup = BeautifulSoup(open("../index.html"), "html.parser")
        last_updated = soup.find("span", {"class": "last_updated"})
        last_updated.string = update_time

        with open("../index.html", "w") as f:
            f.write(str(soup))

        

    