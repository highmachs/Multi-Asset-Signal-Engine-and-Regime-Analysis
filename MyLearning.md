# My Learning Journey: Building an Institutional Quant Framework

When I started this project, I wanted to move beyond simple "moving average crossovers" and build something that a real desk might use. I quickly realized that the gap between a "backtest script" and a "research platform" is massive. Here is what I learned navigating that gap.

## 1. The "Split-Brain" Architecture Struggle

My biggest engineering challenge was marrying the Python data science ecosystem with a modern Node.js/React web stack.

* **The Problem**: I initially tried to run everything in Python (Streamlit), but it felt clunky. I wanted a sleek dashboard.
* **The Pivot**: I decided to spawn a Python child process from Node.
* **What I Learnt**: This was harder than it looked. `stdout` is a fragile way to communicate. I caught library warnings polluting my JSON output, causing the frontend to crash. I had to write a custom parser to filter out the noise. Next time, I'd probably use a proper message queue like Redis, but building this IPC layer manually taught me exactly how OS processes communicate.

## 2. Data is Messier Than Code

I underestimated how difficult it is to align different asset classes.

* **The "NaN" Nightmare**: Crypto trades 24/7. Stocks trade 9-5. Merging them resulted in massive holes in the data.
* **The Solution**: I learned about `pandas.resample` and `ffill` (forward fill). I had to make a design decision: do I drop the weekends (losing crypto info) or fill the stocks (creating flat lines)? I chose to forward-fill the stocks to preserve the continuous nature of global macro correlations. This taught me that **data cleaning is 80% of the job**.

## 3. The "Aha!" Moment: Vectorization

At first, my code loop for calculating lagged correlations was painfully slow.

* `for symbol in symbols: for lag in lags:` ... it took 45 seconds to run.
* I learned about **Vectorization** in Pandas. By shifting the entire dataframe at once, I cut the execution time down to <200ms. Seeing that speedup was the highlight of the project for me. It showed me why "Big O" notation actually matters in finance.

## 4. Moving Beyond "Linear" Thinking

I learned that a simple correlation number is dangerous.

* Realizing that *correlation is not stable* was a big turning point. That's why I added the **Regime Detection**.
* Implementing the "Volatility Classifier" made me appreciate that a signal in 2020 (High Vol) means something totally different than in 2017 (Low Vol).

## 5. Mastering the Modern Stack

Coming from a "Jupyter Notebook" background, building a production app was a leap.

* **React & Vite**: I used to think HTML/CSS was enough, but React's component model (reusing the `LeadLagChart`) saved me hours of rewriting code. Vite made the dev-loop instant, unlike the slow webpack builds I read about.
* **Dockerization**: "It works on my machine" wasn't good enough. Writing the `Dockerfile` was tricky (getting Python AND Node in one container), but now I can deploy this anywhere with `docker compose up`.
* **Postgres + ORM**: Moving from CSV files to a real relational database (Postgres) accessed via Drizzle ORM taught me the value of *type safety* in database queries.

## Final Thoughts

This project pushed me to be a better full-stack engineer and a more rigorous thinker. I'm thinking more now about statistical significance, latency, and system stability.
