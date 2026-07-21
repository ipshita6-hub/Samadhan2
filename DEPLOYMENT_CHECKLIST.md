# ✅ Deployment Checklist

## **Pre-Deployment (Do These First)**

- [ ] All code committed to GitHub (`main` branch)
- [ ] Backend `.env` values match what you need for production
- [ ] Frontend `.env` has correct REACT_APP_API_URL
- [ ] MongoDB Atlas cluster created (if using cloud DB)
- [ ] Firebase project created and credentials downloaded
- [ ] No secrets in code (check `.gitignore`)
- [ ] `requirements.txt` updated with gunicorn
- [ ] `vercel.json` created in frontend
- [ ] `render.yaml` created in root
- [ ] `Procfile` created in root

## **Vercel Deployment**

- [ ] Account created at vercel.com
- [ ] GitHub connected
- [ ] Repository imported
- [ ] 6 environment variables added
- [ ] Build succeeds (check logs)
- [ ] Frontend URL received (e.g., samadhan-frontend.vercel.app)
- [ ] Deployment shows "Production" status
- [ ] Can access frontend URL in browser

## **Render Deployment**

- [ ] Account created at render.com
- [ ] GitHub connected
- [ ] Web Service created
- [ ] Build Command set correctly
- [ ] Start Command set correctly
- [ ] 4 environment variables added
- [ ] Firebase credentials file uploaded (Secret Files)
- [ ] Service deployed successfully
- [ ] Backend URL received (e.g., samadhan-backend.onrender.com)
- [ ] Health check passes: `/health` returns `{"status": "ok"}`

## **Post-Deployment Testing**

- [ ] Frontend loads without errors
- [ ] Can sign up with Firebase
- [ ] Can create a ticket
- [ ] Dashboard stats load
- [ ] Can see tickets
- [ ] Can view ticket details
- [ ] Can add comments
- [ ] Real-time updates work (if applicable)
- [ ] Admin dashboard works
- [ ] Analytics page loads
- [ ] Settings page loads
- [ ] File uploads work
- [ ] Search functionality works

## **Final Steps**

- [ ] Share frontend URL with team
- [ ] Monitor error logs first 24 hours
- [ ] Test on mobile
- [ ] Test with different user roles
- [ ] Verify database backups
- [ ] Set up monitoring (Sentry free tier)
- [ ] Create GitHub issue if bugs found
- [ ] Document any deployment issues

## **Performance Checks**

- [ ] Homepage loads in <2 seconds
- [ ] Dashboard loads in <1 second
- [ ] API responses in <500ms
- [ ] No console errors
- [ ] Lighthouse score >80

## **Backup & Security**

- [ ] Database has backups enabled
- [ ] Firebase rules reviewed
- [ ] API rate limiting configured
- [ ] CORS properly restricted
- [ ] Secrets not exposed in frontend
- [ ] HTTPS enforced

## **Scale When Ready**

- [ ] Upgrade Render to paid ($7/mo) for always-on
- [ ] Upgrade MongoDB Atlas to M10 ($57/mo) for production
- [ ] Add Redis for caching
- [ ] Set up monitoring (Sentry, DataDog)
- [ ] Add CDN for static assets
- [ ] Plan for load balancing

---

## **Quick Reference**

**If deployment fails:**
1. Check Vercel/Render logs
2. Verify environment variables
3. Verify GitHub is up to date
4. Retry deployment
5. Check docs for service-specific requirements

**If backend not connecting:**
1. Verify backend URL in frontend `.env`
2. Check CORS_ORIGINS includes frontend URL
3. Test `/health` endpoint manually
4. Check MongoDB connection string
5. Check Firebase credentials path

**If slow:**
1. Render free tier might be spinning up (30 sec)
2. Add caching layer
3. Optimize database queries
4. Upgrade to paid plans
5. Add CDN

---

**Status:** Ready for deployment! 🚀
