# * * * STARTING GUIDE * * *

# Step 0
Requirements:
- [NodeJS](https://nodejs.org/en) 

# Step 1
Execute the script at /docs/db/script.sql

# Step 2
Generate your own secrets.
You'll need 3 secrets.
- session
- mailer
- password reset

Use the following command:  
`$ node -e "console.log(crypto.randomBytes(32).toString('hex'))"`

# Step 3
rename .env.example to .env & set your own data  
`$ mv ./.env.example  ./.env`

# Step 3.1 - Set a domain
Get yourself a domain at [register.it](https://www.register.it/) or [NameCheap](https://www.namecheap.com/) if you want to start without spending much money

# Step 3.2 - Set up a DB
These are the best options imo:
- Oracle's free MYSQL HEATWAVE DB ([check out this tutorial](https://www.youtube.com/watch?v=w76YcuDIVNE&t=1064s))
- VPS (such as [GameHosting](https://www.gamehosting.it/))

However, if you do not want to spend time looking into them, you can start with a simple [XAMPP](https://www.apachefriends.org/it/index.html)

Remember to save this data:
- DATABASE_HOST
- DATABASE_USER
- DATABASE_PASSWORD
- DATABASE_NAME

# Step 3.3 - Configure prisma
Prisma has a good amount of tutorials, you can either check the ([Docs](https://www.prisma.io/docs/orm/prisma-client/setup-and-configuration/introduction)) or look a video on [YT](https://www.youtube.com/watch?v=QXxy8Uv1LnQ&t=1567s).  
In the .env file at #3 (DATABASE_URL string), substitute $DATABASE_USER, $DATABASE_PASSWORD, $DATABASE_HOST, and $DATABASE_NAME with the data you've set up in the previous step

# Step 3.4 - Secrets
You have already generated the secrets, now is the time to use them

# Step 3.5 - Set up an SMTP server
I recommend:
- [SMTP on GMAIL](https://www.youtube.com/watch?v=ZfEK3WP73eY)
- [Resend](https://resend.com/)

# Step 4 - Run the project
Now that everything has been set up, you can run the project with the following command:
`$ npm run dev`

You should now see two links, one of them being somewhat similar to: http://localhost:3000.  
Click on the link and you'll be taken to your browser at the right page

# Step 5 - The end
Congrats! You have sucessfully run the project.  
You can now use the entire the software as you want, just **RESPECT THE LICENSE** !!
