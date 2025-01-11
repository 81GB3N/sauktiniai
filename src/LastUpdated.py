from playwright.sync_api import sync_playwright

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
    
    def write_to_html(self, last_updated):
        with open("../index.html", "r") as file:
            html_content = file.read()

        html_content = html_content.replace("{{ last_updated }}", last_updated)

        with open("../index.html", "w") as file:
            file.write(html_content)
        
        print("Updated index.html")

    