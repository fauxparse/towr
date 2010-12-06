class ProfileLinks < ActiveRecord::Migration
  def self.up
    %w(twitter facebook).each do |method|
      change_table :"#{method}_authentications" do |t|
        t.boolean :visible, :default => true, :null => false
        t.string :link if method == "facebook"
      end
    end
  end

  def self.down
    %w(twitter facebook).each do |method|
      change_table :"#{method}_authentications" do |t|
        t.remove :visible
        t.remove :link if method == "facebook"
      end
    end
  end
end
