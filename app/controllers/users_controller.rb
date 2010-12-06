# encoding: UTF-8
class UsersController < ApplicationController
  require_login :except => :index
  
  def edit
    @user = current_user
  end
  
  def update
    @user = current_user
    if @user.update_attributes params[:user]
      flash[:message] = "Great! We’ve saved those details."
      redirect_to my_account_path
    else
      render :action => :edit
    end
  end
  
  def connect
    redirect_to api.authentication_url(connect_callback_url(params[:method]))
  end
  
  def connect_callback
    if @user = api.login
      if @user != current_user
        @user.send(params[:method]).update_attribute :user_id, current_user.id
        @user.reload
        current_user.merge! @user
      end
    else
      flash[:message] = "There was a problem logging you in."
    end
    redirect_to my_account_path
  end

protected
  def api
    @api ||= Auth[params[:method]].try(:new, self)
  end
end
