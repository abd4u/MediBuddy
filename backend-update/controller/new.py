import os
import threading
import time
import tkinter as tk
from tkinter import ttk
import pygame
from gtts import gTTS
import speech_recognition as sr
from googletrans import LANGUAGES, Translator

# Initialize translator and language mapping
translator = Translator()
pygame.mixer.init()

language_mapping = {name: code for code, name in LANGUAGES.items()}

def get_language_code(language_name):
    return language_mapping.get(language_name, language_name)

def translator_function(spoken_text, to_language):
    # Use "auto" to automatically detect the language of the spoken text
    return translator.translate(spoken_text, src="auto", dest=to_language)

def text_to_voice(text_data, to_language):
    try:
        myobj = gTTS(text=text_data, lang=to_language, slow=False)
        myobj.save("cache_file.mp3")
        audio = pygame.mixer.Sound("cache_file.mp3")
        audio.play()
        time.sleep(audio.get_length())  # Wait until audio finishes
        os.remove("cache_file.mp3")
    except Exception as e:
        print(f"Error with text-to-voice: {e}")

def main_process(to_language, stop_event):
    while not stop_event.is_set():
        rec = sr.Recognizer()
        with sr.Microphone() as source:
            try:
                rec.pause_threshold = 1
                audio = rec.listen(source, phrase_time_limit=10)

                spoken_text = rec.recognize_google(audio)  # Language auto-detection
                translated_text = translator_function(spoken_text, to_language)

                # Convert translated text to voice only (no display)
                text_to_voice(translated_text.text, to_language)

                time.sleep(2)
            except sr.RequestError:
                print("Error: Cannot access Google Speech Recognition service")
                time.sleep(2)
            except sr.UnknownValueError:
                print("Error: Failed to recognize speech")
                time.sleep(2)
            except Exception as e:
                print(f"Error: {str(e)}")
                time.sleep(2)

def start_translation():
    if not to_language_combobox.get():
        print("Please select a target language.")
        return

    global stop_event
    stop_event = threading.Event()

    to_language = get_language_code(to_language_combobox.get())
    threading.Thread(target=main_process, args=(to_language, stop_event)).start()

def stop_translation():
    if stop_event:
        stop_event.set()
    on_close()  # Close the Tkinter window when stop button is pressed

# Setup Tkinter UI
root = tk.Tk()
root.title("Real-Time Voice Translator")

# Target Language Dropdown
tk.Label(root, text="Select Target Language:").pack()
to_language_combobox = ttk.Combobox(root, values=list(LANGUAGES.values()))
to_language_combobox.pack()

# Start and Stop buttons
start_button = tk.Button(root, text="Start", command=start_translation)
start_button.pack(pady=10)

stop_button = tk.Button(root, text="Stop", command=stop_translation)
stop_button.pack(pady=10)

# Ensure pygame quits on exit
def on_close():
    pygame.mixer.quit()
    root.destroy()

root.protocol("WM_DELETE_WINDOW", on_close)
root.mainloop()
